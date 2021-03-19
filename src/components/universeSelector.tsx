import { Universe } from 'mapwize-sdk-react-native'
import React from 'react'
import icons from '../icons'
import Selector from './selector'

export interface UniverseSelectorState {
  isExpanded: boolean
  isHidden: boolean
  universes: Universe[]
  selectedUniverse?: Universe
  tooltipMessage: string
  mainColor: string
}

export interface UniverseSelectorProps {
  style: any
  reduxState: UniverseSelectorState
  onUniverseSelected: (universe: Universe) => void
  onClick: () => void
}

const UniverseSelector = ({
  style,
  reduxState: {
    isExpanded,
    isHidden,
    universes,
    selectedUniverse,
    tooltipMessage,
  },
  onUniverseSelected,
  onClick,
}: UniverseSelectorProps) => {
  return (
    <>
      <Selector
        style={style}
        isExpanded={isExpanded}
        isHidden={isHidden}
        tooltipMessage={tooltipMessage}
        icon={icons.UNIVERSE}
        data={universes}
        isSelected={(universe: Universe) =>
          universe._id === selectedUniverse?._id
        }
        renderText={(universe: Universe) => universe.name}
        onSelected={(universe: Universe) => onUniverseSelected(universe)}
        onClick={onClick}
      />
    </>
  )
}

export default UniverseSelector
