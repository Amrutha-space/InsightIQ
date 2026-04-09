-- InsightIQ Database Schema
-- AI-Powered Business Analytics Platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    columns_info JSONB, -- Store column names and types
    row_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data queries table
CREATE TABLE IF NOT EXISTS data_queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    query_name VARCHAR(255) NOT NULL,
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) DEFAULT 'custom', -- 'predefined' or 'custom'
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query results cache
CREATE TABLE IF NOT EXISTS query_results (
    id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES data_queries(id) ON DELETE CASCADE,
    result_data JSONB NOT NULL,
    execution_time INTEGER, -- in milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'trend', 'anomaly', 'prediction', 'recommendation'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    metadata JSONB, -- Additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    scenario_name VARCHAR(255) NOT NULL,
    parameters JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'pdf', 'csv', 'json'
    file_path VARCHAR(500),
    content JSONB, -- For JSON reports
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_data_queries_user_id ON data_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_data_queries_dataset_id ON data_queries(dataset_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dataset_id ON ai_insights(dataset_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_queries_updated_at BEFORE UPDATE ON data_queries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample predefined queries
INSERT INTO data_queries (user_id, dataset_id, query_name, query_text, query_type, is_favorite) VALUES
(1, 1, 'Top 10 Products by Revenue', 'SELECT product_name, SUM(revenue) as total_revenue FROM data GROUP BY product_name ORDER BY total_revenue DESC LIMIT 10', 'predefined', TRUE),
(1, 1, 'Revenue Trends by Month', 'SELECT DATE_TRUNC(''month'', date) as month, SUM(revenue) as monthly_revenue FROM data GROUP BY month ORDER BY month', 'predefined', TRUE),
(1, 1, 'Regional Sales Analysis', 'SELECT region, COUNT(*) as total_sales, SUM(revenue) as total_revenue FROM data GROUP BY region ORDER BY total_revenue DESC', 'predefined', TRUE)
ON CONFLICT DO NOTHING;
