interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3
  totalSteps: 3
}

/**
 * Three-dot step indicator. Filled dots for current and completed steps.
 * Fixed height prevents layout shift between steps.
 */
export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 h-10">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1
        const isActive = stepNum <= currentStep
        return (
          <span
            key={stepNum}
            aria-label={`Step ${stepNum} of ${totalSteps}${stepNum === currentStep ? ' (current)' : stepNum < currentStep ? ' (completed)' : ''}`}
            className={`block w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
              isActive ? 'bg-blue-500' : 'bg-slate-600'
            }`}
          />
        )
      })}
    </div>
  )
}
