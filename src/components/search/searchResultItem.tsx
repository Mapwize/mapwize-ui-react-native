import React from 'react'
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { SearchResult } from '../../types'

export interface SearchResultItemProps {
  style: any
  result: SearchResult
  onClick: (result: SearchResult) => void
}

const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  return (
    <>
      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={() => {
          onClick(result)
        }}
      >
        <View style={styles.container}>
          <Image
            style={[styles.icon]}
            source={{ uri: result?.cache?.['30'] || result?.icon }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{result.title}</Text>
            {result.subtitle !== undefined && result.subtitle.length > 0 && (
              <Text style={styles.itemSubtitle}>{result.subtitle}</Text>
            )}

            <Text style={styles.itemFloor}>Floor {result.floor}</Text>
          </View>
        </View>
      </TouchableHighlight>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 24,
  },
  item: { padding: 16 },
  itemTitle: {
    fontSize: 18,
  },
  itemSubtitle: {
    color: 'gray',
  },
  itemFloor: {
    color: 'gray',
  },
})

export default SearchResultItem
