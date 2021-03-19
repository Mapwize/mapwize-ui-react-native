import React from 'react'
import {
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native'

export interface SearchBarState {
  searchQuery: string
  isHidden: boolean
  isInSearch: boolean
  searchPlaceholder: string
  directionButtonHidden: boolean
  menuTooltipMessage: string
  directionTooltipMessage: string
  backTooltipMessage: string
  mainColor: string
}

export interface SearchBarProps {
  style: any
  reduxState: SearchBarState
  menuButtonHidden?: boolean
  onSearchTextFocus: () => void
  onSearchTextBlur: () => void
  onSearchTextChange: (text: string) => void
  onMenuClick: () => void
  onDirectionClick: () => void
  onBackClick: () => void
}

const SearchBar = ({
  style,
  reduxState: {
    searchQuery,
    isHidden,
    isInSearch,
    searchPlaceholder,
    directionButtonHidden,
    menuTooltipMessage,
    directionTooltipMessage,
    backTooltipMessage,
  },
  menuButtonHidden,
  onSearchTextFocus,
  onSearchTextBlur,
  onSearchTextChange,
  onMenuClick,
  onDirectionClick,
  onBackClick,
}: SearchBarProps) => {
  let menuButtonGone = isInSearch
  let backButtonGone = !isInSearch
  return (
    <>
      <SafeAreaView style={isHidden && styles.isHidden}>
        <View
          style={[
            style,
            styles.searchBar,
            isHidden && styles.isHidden,
            isInSearch && styles.isInSearch,
          ]}
        >
          {!menuButtonHidden && (
            <TouchableHighlight
              style={styles.touchableHighlightLeft}
              activeOpacity={0.6}
              underlayColor="#DDDDDD"
              accessibilityLabel={menuTooltipMessage}
              onPress={() => onMenuClick()}
            >
              <View
                style={[
                  styles.menuButton,
                  menuButtonGone && styles.menuButtonGone,
                ]}
              >
                <Image
                  style={[styles.icon]}
                  source={require('../../resources/burger-menu.png')}
                />
              </View>
            </TouchableHighlight>
          )}
          <TouchableHighlight
            style={styles.touchableHighlightLeft}
            activeOpacity={0.6}
            underlayColor="#DDDDDD"
            accessibilityLabel={backTooltipMessage}
            onPress={() => {
              Keyboard.dismiss()
              onBackClick()
            }}
          >
            <View
              style={[
                styles.icon,
                styles.menuButton,
                backButtonGone && styles.backButtonGone,
              ]}
            >
              <Image
                style={[styles.icon]}
                source={require('../../resources/back.png')}
              />
            </View>
          </TouchableHighlight>
          <TextInput
            style={styles.text}
            placeholder={searchPlaceholder}
            // showSoftInputOnFocus={true}
            onFocus={() => {
              onSearchTextFocus()
              onSearchTextChange('')
            }}
            onBlur={() => {
              // Keyboard.dismiss();
              // onSearchTextBlur();
            }}
            onChangeText={(text: string) => onSearchTextChange(text)}
            value={searchQuery}
            // blurOnSubmit={true}
          />
          <TouchableHighlight
            style={styles.touchableHighlightRight}
            activeOpacity={0.6}
            underlayColor="#DDDDDD"
            accessibilityLabel={backTooltipMessage}
            onPress={() => {
              onDirectionClick()
            }}
          >
            <View
              style={[
                styles.icon,
                styles.menuButton,
                directionButtonHidden && styles.directionButtonHidden,
              ]}
            >
              <Image
                style={[styles.icon]}
                source={require('../../resources/directions.png')}
              />
            </View>
          </TouchableHighlight>
        </View>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  searchBar: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'row',
    elevation: 8,
    margin: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: {
    flex: 1,
    paddingHorizontal: 8,
    // backgroundColor: 'red',
  },
  icon: {
    width: 24,
    height: 24,
  },
  menuButton: {
    padding: 12,
    width: 48,
    height: 48,
  },
  menuButtonGone: {
    display: 'none',
  },
  touchableHighlightLeft: {
    borderBottomStartRadius: 8,
    borderTopStartRadius: 8,
  },
  touchableHighlightRight: {
    borderBottomEndRadius: 8,
    borderTopEndRadius: 8,
  },
  backButtonGone: { display: 'none' },
  directionButtonHidden: { display: 'none' },
  isHidden: { display: 'none' },
  isInSearch: {},
  item: { padding: 16 },
})

export default SearchBar
