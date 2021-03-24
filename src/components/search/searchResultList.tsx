import { Universe } from 'mapwize-sdk-react-native'
import React from 'react'
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'
import icons from '../../icons'
import { DevCallbackInterceptor } from '../../devCallbackInterceptor'
import { SearchResult } from '../../types'
import SearchResultItem from './searchResultItem'

export interface SearchResultListState {
  isHidden: boolean
  isInDirectionSearch: boolean
  results?: SearchResult[]
  showCurrentLocation: string | undefined
  noResultLabel: string
  universes: Universe[]
  currentUniverse: Universe | undefined
  mainColor: string
}

export interface SearchResultListProps {
  style: any
  reduxState: SearchResultListState
  callbackInterceptor: DevCallbackInterceptor
  onResultSelected: (
    searchResult: SearchResult,
    universe?: Universe | undefined
  ) => void
  onCurrentLocationSelected: () => void
}

const SearchResultList = ({
  style,
  reduxState: {
    isHidden,
    isInDirectionSearch,
    results,
    showCurrentLocation,
    noResultLabel,
    universes,
    currentUniverse,
  },
  onResultSelected,
  onCurrentLocationSelected,
}: SearchResultListProps) => {
  return (
    <>
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
      >
        <View
          style={[
            style,
            styles.searchResultList,
            isHidden && styles.isHidden,
            isInDirectionSearch && styles.isInDirectionSearch,
          ]}
        >
          {showCurrentLocation && (
            <TouchableHighlight
              activeOpacity={0.6}
              underlayColor="#DDDDDD"
              onPress={() => onCurrentLocationSelected()}
            >
              <View style={styles.currentLocationContainer}>
                <Image style={[styles.icon]} source={icons.GEOLOC_ON} />
                <Text style={styles.item}>{showCurrentLocation}</Text>
              </View>
            </TouchableHighlight>
          )}
          {buildList(results, universes, currentUniverse, onResultSelected)}
          {(!results || results?.length === 0) && (
            <Text style={styles.item}>{noResultLabel}</Text>
          )}
        </View>
      </ScrollView>
    </>
  )
}

const buildList = (
  results: SearchResult[] | undefined,
  universes: Universe[],
  currentUniverse: Universe | undefined,
  onResultSelected: (
    searchResult: SearchResult,
    universe?: Universe | undefined
  ) => void
) => {
  if (universes.length <= 1) {
    return results?.map((result: SearchResult, index: number) => {
      return (
        <SearchResultItem
          style={styles.item}
          key={index}
          result={result}
          onClick={() => {
            Keyboard.dismiss()
            onResultSelected(result)
          }}
        />
      )
    })
  }
  let grouped: any = {}
  universes.forEach((u) => {
    grouped[u._id] = []
  })
  results?.forEach((r) => {
    ;(r as any).universes?.forEach((u: any) => {
      if (grouped[u._id]) {
        grouped[u._id].push(r)
      }
    })
  })
  let groupedArray: any[] = []
  for (const key in grouped) {
    if (grouped[key].length === 0) {
      continue
    }
    if (key === currentUniverse?._id) {
      let innerElements: any[] = []
      grouped[key].forEach((r: any) => {
        innerElements.push(
          <SearchResultItem
            style={styles.item}
            key={r._id + key}
            result={r}
            onClick={() => {
              Keyboard.dismiss()
              onResultSelected(r)
            }}
          />
        )
      })
      groupedArray = innerElements.concat(groupedArray)
    } else {
      let innerElements: any[] = []
      const universe = universes.find((u) => u._id === key)
      const separator = (
        <Text style={styles.separator} key={'sep' + key}>
          {universe?.name}
        </Text>
      )
      innerElements.push(separator)
      grouped[key].forEach((r: any) => {
        innerElements.push(
          <SearchResultItem
            style={styles.item}
            key={r._id + key}
            result={r}
            onClick={() => {
              Keyboard.dismiss()
              onResultSelected(r, universe)
            }}
          />
        )
      })
      groupedArray = groupedArray.concat(innerElements)
    }
  }
  return groupedArray
}

const styles = StyleSheet.create({
  searchResultList: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    marginVertical: 16,
    marginHorizontal: 8,
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  isHidden: { display: 'none' },
  isInDirectionSearch: {},
  item: { paddingVertical: 16, fontSize: 18, marginLeft: 24 },
  separator: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#EEEEEE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    width: 20,
    height: 20,
  },
  currentLocationContainer: {
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default SearchResultList
