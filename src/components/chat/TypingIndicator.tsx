export function TypingIndicator() {
    return (
      <div className="flex items-center space-x-1 mt-1">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></span>
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-400"></span>
      </div>
    )
  }
  