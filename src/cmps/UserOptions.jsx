export function UserOptions({ options, isHover }) {
  return (
    <div
      className='user-options-container'
      onMouseEnter={() => {
        isHover.current = true
      }}
      onMouseLeave={() => {
        isHover.current = false
      }}
    >
      {options.map((option) => {
        return (
          <div
            className='option-container'
            key={option.text}
            onClick={option.onClick}
          >
            <span>{option.text}</span>
          </div>
        )
      })}
    </div>
  )
}
