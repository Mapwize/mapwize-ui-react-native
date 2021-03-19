import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface SearchContainerState {
  isInSearch: boolean
  mainColor: string
}

export interface SearchContainerProps {
  style: any
  reduxState: SearchContainerState
  children: any
}

const SearchContainer = ({
  style,
  reduxState: { isInSearch },
  children,
}: SearchContainerProps) => {
  return (
    <>
      <View
        style={[style, styles.searchContainer, isInSearch && styles.isInSearch]}
      >
        {children}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  searchContainer: {},
  isInSearch: {
    backgroundColor: 'white',
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
})

export default SearchContainer
