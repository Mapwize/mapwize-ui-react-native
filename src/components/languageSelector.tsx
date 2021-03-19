import React from 'react'
import icons from '../icons'
import Selector from './selector'

export interface LanguageSelectorState {
  isExpanded: boolean
  isHidden: boolean
  languages: LanguageDisplay[]
  selectedLanguage?: string
  tooltipMessage: string
  mainColor?: string
}
export interface LanguageDisplay {
  code: string
  value: string
}

export interface LanguageSelectorProps {
  style: any
  reduxState: LanguageSelectorState
  onLanguageSelected: (language: string) => void
  onClick: () => void
}

const LanguageSelector = ({
  style,
  reduxState: {
    isExpanded,
    isHidden,
    languages,
    selectedLanguage,
    tooltipMessage,
  },
  onLanguageSelected,
  onClick,
}: LanguageSelectorProps) => {
  return (
    <>
      <Selector
        style={style}
        isExpanded={isExpanded}
        isHidden={isHidden}
        tooltipMessage={tooltipMessage}
        icon={icons.GLOBE}
        data={languages}
        isSelected={(language: LanguageDisplay) =>
          language.value === selectedLanguage
        }
        renderText={(language: LanguageDisplay) => language.value}
        onSelected={(language: LanguageDisplay) =>
          onLanguageSelected(language.code)
        }
        onClick={onClick}
      />
    </>
  )
}

export default LanguageSelector
