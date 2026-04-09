const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const pool = require('../config/database');

const router = express.Router();

// Generate AI insights
router.post('/insights', authMiddleware, async (req, res) => {
  try {
    const { datasetId, insightType, data } = req.body;

    // Verify dataset ownership
    const datasetResult = await pool.query(
      'SELECT * FROM datasets WHERE id = $1 AND user_id = $2',
      [datasetId, req.user.id]
    );

    if (datasetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or access denied'
      });
    }

    // Generate insights using AI
    const insights = await generateInsights(data, insightType);

    // Save insights to database
    const savedInsights = [];
    for (const insight of insights) {
      const result = await pool.query(
        'INSERT INTO ai_insights (user_id, dataset_id, insight_type, title, content, confidence_score, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          req.user.id,
          datasetId,
          insight.type,
          insight.title,
          insight.content,
          insight.confidence,
          JSON.stringify(insight.metadata || {})
        ]
      );
      savedInsights.push(result.rows[0]);
    }

    res.json({
      success: true,
      data: savedInsights.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.title,
        content: insight.content,
        confidence: parseFloat(insight.confidence_score),
        metadata: JSON.parse(insight.metadata || '{}'),
        createdAt: insight.created_at
      }))
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating insights'
    });
  }
});

// Get saved insights
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const { datasetId, type } = req.query;
    
    let query = 'SELECT * FROM ai_insights WHERE user_id = $1';
    const params = [req.user.id];
    
    if (datasetId) {
      query += ' AND dataset_id = $' + (params.length + 1);
      params.push(datasetId);
    }
    
    if (type) {
      query += ' AND insight_type = $' + (params.length + 1);
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.title,
        content: insight.content,
        confidence: parseFloat(insight.confidence_score),
        metadata: JSON.parse(insight.metadata || '{}'),
        createdAt: insight.created_at
      }))
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving insights'
    });
  }
});

// Run what-if simulation
router.post('/simulation', authMiddleware, validateRequest(schemas.simulation), async (req, res) => {
  try {
    const { datasetId, parameters, scenario } = req.body;

    // Verify dataset ownership
    const datasetResult = await pool.query(
      'SELECT * FROM datasets WHERE id = $1 AND user_id = $2',
      [datasetId, req.user.id]
    );

    if (datasetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or access denied'
      });
    }

    // Run simulation
    const simulationResults = await runSimulation(parameters, scenario);

    // Save simulation results
    const result = await pool.query(
      'INSERT INTO simulations (user_id, dataset_id, scenario_name, parameters, results) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        req.user.id,
        datasetId,
        scenario,
        JSON.stringify(parameters),
        JSON.stringify(simulationResults)
      ]
    );

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        scenarioName: result.rows[0].scenario_name,
        parameters: JSON.parse(result.rows[0].parameters),
        results: JSON.parse(result.rows[0].results),
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error running simulation'
    });
  }
});

// Get simulation history
router.get('/simulations', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM simulations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.map(sim => ({
        id: sim.id,
        scenarioName: sim.scenario_name,
        parameters: JSON.parse(sim.parameters),
        results: JSON.parse(sim.results),
        createdAt: sim.created_at
      }))
    });
  } catch (error) {
    console.error('Get simulations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving simulations'
    });
  }
});

// Helper functions
async function generateInsights(data, insightType) {
  try {
    // Use OpenAI or Groq API for insights generation
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    const apiUrl = process.env.OPENAI_API_KEY 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.groq.com/openai/v1/chat/completions';

    if (!apiKey) {
      // Fallback to rule-based insights if no API key
      return generateRuleBasedInsights(data, insightType);
    }

    const prompt = createInsightPrompt(data, insightType);
    
    const response = await axios.post(apiUrl, {
      model: process.env.OPENAI_API_KEY ? 'gpt-3.5-turbo' : 'llama2-70b-4096',
      messages: [
        {
          role: 'system',
          content: 'You are a business analytics expert. Provide concise, actionable insights based on the data provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    return parseAIResponse(aiResponse, insightType);
  } catch (error) {
    console.error('AI API error:', error);
    // Fallback to rule-based insights
    return generateRuleBasedInsights(data, insightType);
  }
}

function createInsightPrompt(data, insightType) {
  const dataSummary = Array.isArray(data) ? data.slice(0, 10) : [];
  
  return `Analyze this business data and provide 3-5 key insights for ${insightType} analysis:
  
Data Sample: ${JSON.stringify(dataSummary, null, 2)}

Please provide insights in the following format:
1. [Insight title]
   [Detailed explanation]

2. [Insight title]
   [Detailed explanation]

Focus on actionable business insights that could help improve performance.`;
}

function parseAIResponse(response, insightType) {
  const insights = [];
  const lines = response.split('\n').filter(line => line.trim());
  
  let currentInsight = null;
  
  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      if (currentInsight) {
        insights.push(currentInsight);
      }
      currentInsight = {
        type: insightType,
        title: line.replace(/^\d+\.\s*/, '').trim(),
        content: '',
        confidence: 0.8,
        metadata: { source: 'ai-generated' }
      };
    } else if (currentInsight && line.trim()) {
      currentInsight.content += line.trim() + ' ';
    }
  }
  
  if (currentInsight) {
    insights.push(currentInsight);
  }
  
  return insights.length > 0 ? insights : generateRuleBasedInsights([], insightType);
}

function generateRuleBasedInsights(data, insightType) {
  // Fallback rule-based insights
  const insights = [];
  
  if (insightType === 'trend') {
    insights.push({
      type: 'trend',
      title: 'Data Trend Analysis',
      content: 'Based on the available data, we recommend monitoring key metrics over time to identify patterns and trends.',
      confidence: 0.6,
      metadata: { source: 'rule-based' }
    });
  } else if (insightType === 'anomaly') {
    insights.push({
      type: 'anomaly',
      title: 'Anomaly Detection',
      content: 'Consider implementing statistical outlier detection to identify unusual patterns in your data.',
      confidence: 0.6,
      metadata: { source: 'rule-based' }
    });
  } else {
    insights.push({
      type: insightType,
      title: 'General Recommendation',
      content: 'Continue analyzing your data regularly to maintain business performance and identify opportunities for improvement.',
      confidence: 0.5,
      metadata: { source: 'rule-based' }
    });
  }
  
  return insights;
}

async function runSimulation(parameters, scenario) {
  // Simplified simulation logic
  const results = {
    scenario,
    parameters,
    predictions: {},
    recommendations: []
  };

  switch (scenario) {
    case 'price_change':
      const priceChange = parameters.priceChange || 0;
      const currentRevenue = parameters.currentRevenue || 100000;
      const priceElasticity = parameters.priceElasticity || -1.5;
      
      const projectedRevenue = currentRevenue * (1 + priceChange/100) * (1 + (priceElasticity * priceChange/100));
      
      results.predictions = {
        projectedRevenue: Math.max(0, projectedRevenue),
        revenueChange: projectedRevenue - currentRevenue,
        revenueChangePercent: ((projectedRevenue - currentRevenue) / currentRevenue) * 100
      };
      
      results.recommendations = [
        priceChange > 0 ? 'Consider the impact of price increase on customer demand' : 'Monitor market response to price reduction',
        'Track competitor pricing strategies',
        'Analyze customer price sensitivity'
      ];
      break;

    case 'market_expansion':
      const newMarkets = parameters.newMarkets || 1;
      const marketSize = parameters.marketSize || 50000;
      const penetrationRate = parameters.penetrationRate || 0.1;
      
      const projectedCustomers = newMarkets * marketSize * penetrationRate;
      const avgOrderValue = parameters.avgOrderValue || 100;
      
      results.predictions = {
        projectedCustomers,
        projectedRevenue: projectedCustomers * avgOrderValue,
        timeToMarket: parameters.timeToMarket || 6
      };
      
      results.recommendations = [
        'Conduct market research before expansion',
        'Develop localized marketing strategies',
        'Establish distribution channels in new markets'
      ];
      break;

    default:
      results.predictions = {
        baseline: parameters.baseline || 1000,
        projected: parameters.projected || 1200,
        confidence: 0.7
      };
      
      results.recommendations = [
        'Monitor key performance indicators',
        'Regularly review simulation assumptions',
        'Update models with actual performance data'
      ];
  }

  return results;
}

module.exports = router;
