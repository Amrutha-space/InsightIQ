import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Animation presets for different use cases
export const animations = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },

  // Fade in with scale
  fadeInScale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Staggered container animation
  staggerContainer: {
    container: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  },

  // Card hover animation
  cardHover: {
    whileHover: { 
      y: -5, 
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    whileTap: { scale: 0.98 }
  },

  // Button animations
  buttonTap: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.05 }
  },

  // Modal animation
  modal: {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    content: {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: 20 },
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },

  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Chart animations
  chart: {
    initial: { opacity: 0, pathLength: 0 },
    animate: { opacity: 1, pathLength: 1 },
    transition: { duration: 1.5, ease: 'easeInOut' }
  },

  // Loading spinner
  spinner: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' }
  },

  // Pulse animation
  pulse: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  },

  // Bounce animation
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
  }
}

// Animation wrapper component
export const AnimationWrapper = ({ 
  children, 
  animation = 'pageTransition',
  className = '',
  delay = 0,
  ...props 
}) => {
  const animationConfig = animations[animation] || animations.pageTransition

  return (
    <motion.div
      className={className}
      {...animationConfig}
      transition={{ 
        ...animationConfig.transition, 
        delay: (animationConfig.transition?.delay || 0) + delay 
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Staggered animation wrapper
export const StaggerWrapper = ({ 
  children, 
  className = '', 
  staggerDelay = 0.1 
}) => {
  const config = animations.staggerContainer

  return (
    <motion.div
      className={className}
      {...config.container}
      transition={{ ...config.container.transition, staggerChildren: staggerDelay }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} {...config.item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Page transition wrapper
export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animations.pageTransition}
    >
      {children}
    </motion.div>
  )
}

// Animated list component
export const AnimatedList = ({ 
  items, 
  renderItem, 
  className = '', 
  itemKey = 'id',
  staggerDelay = 0.05 
}) => {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={animations.staggerContainer.container}
      transition={{ staggerChildren: staggerDelay }}
    >
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item[itemKey] || index}
            variants={animations.staggerContainer.item}
            layout
            exit={{ opacity: 0, x: -20 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

// Animated counter component
export const AnimatedCounter = ({ 
  value, 
  duration = 1, 
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0 
}) => {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const startTime = Date.now()
    const startValue = 0
    const endValue = parseFloat(value) || 0

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      const currentValue = startValue + (endValue - startValue) * easeOutQuart
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [value, duration])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </motion.span>
  )
}

// Animated progress bar
export const AnimatedProgressBar = ({ 
  value, 
  max = 100, 
  className = '',
  color = 'bg-primary-500',
  showLabel = true,
  animated = true 
}) => {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setProgress(value)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setProgress(value)
    }
  }, [value, animated])

  const percentage = Math.min((progress / max) * 100, 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Hover card wrapper
export const HoverCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      className={className}
      {...animations.cardHover}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated button wrapper
export const AnimatedButton = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      className={className}
      {...animations.buttonTap}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Loading spinner component
export const LoadingSpinner = ({ 
  size = 'w-6 h-6', 
  className = '', 
  color = 'text-primary-500' 
}) => {
  return (
    <motion.div
      className={`${size} ${color} ${className}`}
      {...animations.spinner}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 0 20" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

export default AnimationWrapper
