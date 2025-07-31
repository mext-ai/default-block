import React, { useState, useEffect, useRef } from 'react'

interface EditableTextProps {
  id: string
  children: React.ReactNode
  filePath?: string
  propertyPath?: string
  className?: string
  style?: React.CSSProperties
  tag?: keyof JSX.IntrinsicElements
}

const EditableText: React.FC<EditableTextProps> = ({ id, children, filePath = 'src/block.tsx', propertyPath, className, style, tag: Tag = 'span' }) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isInlineEditing, setIsInlineEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const elementRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Register this editable element with the parent
    const registerMessage = {
      type: 'EDITABLE_REGISTER',
      data: {
        id,
        filePath,
        propertyPath,
        text: typeof children === 'string' ? children : '',
        element: elementRef.current?.getBoundingClientRect()
      }
    }

    if (window.parent !== window) {
      window.parent.postMessage(registerMessage, '*')
    }
    window.postMessage(registerMessage, '*')

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'EDITABLE_MODE_CHANGE') {
        console.log(`📥 EditableText [${id}]: Received edit mode change:`, event.data.enabled)
        setIsEditMode(event.data.enabled)
      }

      if (event.data.type === 'EDITABLE_START_INLINE_EDIT' && event.data.id === id) {
        setIsInlineEditing(true)
        setEditValue(typeof children === 'string' ? children : '')
        // Focus the input after a short delay
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 100)
      }

      if (event.data.type === 'EDITABLE_EDIT_REQUEST' && event.data.id === id) {
        const currentText = typeof children === 'string' ? children : ''
        const responseMessage = {
          type: 'EDITABLE_EDIT_RESPONSE',
          data: {
            id,
            filePath,
            propertyPath,
            currentText,
            element: elementRef.current?.getBoundingClientRect()
          }
        }

        if (window.parent !== window) {
          window.parent.postMessage(responseMessage, '*')
        }
        window.postMessage(responseMessage, '*')
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      // Unregister when component unmounts
      const unregisterMessage = {
        type: 'EDITABLE_UNREGISTER',
        data: { id }
      }
      if (window.parent !== window) {
        window.parent.postMessage(unregisterMessage, '*')
      }
      window.postMessage(unregisterMessage, '*')
    }
  }, [id, filePath, propertyPath, children])

  const handleClick = () => {
    if (isEditMode && !isInlineEditing) {
      // Start inline editing
      setIsInlineEditing(true)
      setEditValue(typeof children === 'string' ? children : '')
      // Focus the input after a short delay
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }

  const handleSave = () => {
    // Send the updated text to the parent
    const saveMessage = {
      type: 'EDITABLE_SAVE_INLINE',
      data: {
        id,
        filePath,
        propertyPath,
        oldText: typeof children === 'string' ? children : '',
        newText: editValue
      }
    }

    if (window.parent !== window) {
      window.parent.postMessage(saveMessage, '*')
    }
    window.postMessage(saveMessage, '*')

    setIsInlineEditing(false)
  }

  const handleCancel = () => {
    setIsInlineEditing(false)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleBlur = () => {
    // Auto-save when clicking outside
    handleSave()
  }

  const editableStyle: React.CSSProperties = {
    ...style,
    ...(isEditMode &&
      !isInlineEditing && {
        outline: isHovered ? '2px solid #3b82f6' : '1px dashed #3b82f6',
        cursor: 'pointer',
        position: 'relative'
      })
  }

  // If we're in inline editing mode, render an input
  if (isInlineEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={className}
        style={{
          ...style,
          border: '2px solid #3b82f6',
          borderRadius: '3px',
          padding: '2px 4px',
          background: 'white',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          outline: 'none',
          minWidth: '100px'
        }}
      />
    )
  }

  return (
    <Tag
      ref={elementRef}
      className={className}
      style={editableStyle}
      onClick={handleClick}
      onMouseEnter={() => isEditMode && setIsHovered(true)}
      onMouseLeave={() => isEditMode && setIsHovered(false)}
      data-editable-id={id}
      data-editable-mode={isEditMode}>
      {children}
      {isEditMode && isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '0',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap'
          }}>
          Click to edit
        </div>
      )}
    </Tag>
  )
}

export default EditableText
