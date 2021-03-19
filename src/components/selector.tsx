import React from 'react'
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

export interface SelectorProps {
  style: any
  isExpanded: boolean
  isHidden: boolean
  data: any[]
  icon?: any
  tooltipMessage: string
  renderText?: (object: any) => string
  isSelected?: (object: any) => boolean
  onSelected?: (object: any) => void
  onClick: () => void
}

const Selector = ({
  style,
  isExpanded,
  isHidden,
  data,
  icon,
  tooltipMessage,
  renderText,
  isSelected,
  onSelected,
  onClick,
}: SelectorProps) => {
  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isExpanded}
        onRequestClose={() => onClick()}
      >
        <TouchableWithoutFeedback onPress={onClick}>
          <View style={styles.gray}>
            <View
              style={[
                styles.universeList,
                isExpanded && styles.isExpanded,
                isHidden && styles.isHidden,
              ]}
            >
              <Text style={styles.headerText}>{tooltipMessage}</Text>
              <View style={styles.headerSepartor} />
              {isExpanded &&
                data?.map((object: any, index: number) => (
                  <Text
                    style={[
                      styles.item,
                      isSelected?.(object) && styles.selected,
                      isHidden && styles.isHidden,
                    ]}
                    key={index}
                    onPress={() => onSelected?.(object)}
                  >
                    {renderText?.(object)}
                  </Text>
                ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View
        style={[
          style,
          styles.universeSelector,
          isHidden && styles.isHidden,
          isExpanded && styles.buttonExpanded,
        ]}
        accessibilityLabel={tooltipMessage}
      >
        <TouchableHighlight
          style={[styles.icon, isHidden && styles.isHidden]}
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={onClick}
        >
          <Image style={[styles.image]} source={icon} />
        </TouchableHighlight>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  universeSelector: {
    flexDirection: 'column-reverse',
    backgroundColor: 'white',
    borderRadius: 28,
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gray: {
    flex: 1,
    backgroundColor: '#5559',
    justifyContent: 'center',
  },
  icon: {
    borderRadius: 32,
    padding: 8,
  },
  image: {
    height: 24,
    width: 24,
  },
  selected: { fontWeight: 'bold' },
  isHidden: { display: 'none' },
  universeList: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    opacity: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 8,
  },
  isExpanded: { display: 'flex' },
  buttonExpanded: {
    backgroundColor: 'lightgray',
  },
  item: { padding: 16 },
  headerText: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    fontWeight: 'bold',
  },
  headerSepartor: {
    backgroundColor: 'lightgray',
    height: 1,
    alignSelf: 'stretch',
  },
})

export default Selector
