// @ts-nocheck
import {
  NavigationInfo,
  PlaceDetails,
  Translation,
} from 'mapwize-sdk-react-native'
import { BottomViewDirectionProps } from '../components/bottomview/bottomViewDirection'
import { FloorDisplay } from '../components/floorcontroller'
import { LanguageDisplay } from '../components/languageSelector'
import { lang_floor, lang_search_no_results } from '../localizor'
import { Floor, FormattedPlaceDetails, SearchResult } from '../types'

export const buildFloorDisplays = (
  floors: Floor[],
  language: string
): FloorDisplay[] => {
  return floors.map((f) => {
    const translation = translationForLanguage(f.translations, language)
    return { title: translation?.shortTitle || '' + f.number, number: f.number }
  })
}

export const buildLanguageDisplays = (
  languages: string[]
): LanguageDisplay[] => {
  return languages.map((l) => {
    return {
      code: l,
      value: LANGUAGES[l],
    }
  })
}

export const buildPlaceDetails = (
  placeDetails: PlaceDetails,
  language: string
): FormattedPlaceDetails => {
  const translation = translationForLanguage(
    placeDetails?.translations,
    language
  )
  return {
    ...placeDetails,
    objectClass: 'PlaceDetails',
    titleLabel: translation?.title,
    subtitleLabel:
      translation?.subtitle !== undefined
        ? translation?.subtitle
        : translation?.subTitle,
    detailsLabel: translation?.details,
  }
}

export const buildPlacelistDetails = (
  placelist: any,
  places: any[],
  language: string
): any => {
  const translation = translationForLanguage(placelist.translations, language)
  places = places.map((p) => {
    const t = translationForLanguage(p.translations, language)
    return {
      ...p,
      objectClass: 'Place',
      titleLabel: t?.title,
      subtitleLabel: t?.subtitle,
      floorLabel: lang_floor(language, p.floor),
    }
  })
  return {
    ...placelist,
    titleLabel: translation?.title,
    subtitleLabel: translation?.subtitle,
    detailsLabel: translation?.details,
    places: places,
  }
}

export const buildPlacelist = (placelist: any, language: string): any => {
  const translation = translationForLanguage(placelist.translations, language)
  return {
    ...placelist,
    titleLabel: translation?.title,
    subtitleLabel: translation?.subtitle,
    detailsLabel: translation?.details,
  }
}

export const buildSearchResult = (
  searchResult?: any[],
  language?: string
): SearchResult[] => {
  const map = searchResult?.map((s) => {
    if (!s) {
      return {}
    }
    const translation = translationForLanguage(s.translations, language)
    let floorLabel
    if (s.floor || s.floor === 0) {
      floorLabel = lang_floor(language || 'en', s.floor)
    }
    return {
      ...s,
      title: translation?.title,
      subtitle: translation?.subtitle,
      floorLabel,
    }
  })

  // Fixing missing title for translation
  return map.filter((s) => s.title)
}

export const titleForLanguage = (
  object: any,
  language: string
): string | undefined => {
  return translationForLanguage(object.translations, language)?.title
}

export const subtitleForLanguage = (
  object: any,
  language: string
): string | undefined => {
  return translationForLanguage(object.translations, language)?.subtitle
}

export const buildLanguageDisplay = (language: string): string => {
  return LANGUAGES[language]
}

export const buildDirectionInfo = (
  direction: any,
  unit: string
): BottomViewDirectionProps => {
  const timeInMinuts = Math.floor(direction.traveltime / 60)

  let distanceLabel
  if (unit === 'm') {
    distanceLabel = Math.floor(direction.distance) + ' m'
  } else {
    distanceLabel = Math.floor(direction.distance * 3.28084) + ' ft'
  }
  return {
    durationLabel: timeInMinuts < 1 ? '< 1 min' : timeInMinuts + ' min',
    distanceLabel: distanceLabel,
  }
}

export const buildNavigationInfo = (
  navigationInfo: NavigationInfo,
  unit: string
): BottomViewDirectionProps => {
  const timeInMinuts = Math.floor(navigationInfo.duration / 60)

  let distanceLabel
  if (unit === 'm') {
    distanceLabel = Math.floor(navigationInfo.distance) + ' m'
  } else {
    distanceLabel = Math.floor(navigationInfo.distance * 3.28084) + ' ft'
  }
  return {
    durationLabel: timeInMinuts < 1 ? '< 1 min' : timeInMinuts + ' min',
    distanceLabel: distanceLabel,
  }
}

export const buildDirectionError = (
  language: string
): BottomViewDirectionProps => {
  return {
    durationLabel: '',
    distanceLabel: '',
    errorLabel: lang_search_no_results(language),
  }
}

export const translationForLanguage = (
  translations?: Translation[],
  language?: string
): Translation | undefined => {
  //TODO check why translations is undefined
  const filterTranslation = translations?.filter((t) => t.language === language)
  if (filterTranslation?.length === 0) {
    return translations?.[0]
  } else {
    return filterTranslation?.[0]
  }
}

const LANGUAGES: { [key: string]: string } = {
  da: 'Dansk',
  de: 'Deutsch',
  nl: 'Nederlands',
  hu: 'Magyar',
  es: 'Español',
  fr: 'Français',
  en: 'English',
  fi: 'Suomi',
  ru: 'Pусский язык',
  zh: '中文',
  pt: 'Português',
  it: 'Italiano',
  no: 'Norsk',
  ja: '日本語',
  ar: 'العربية',
  sv: 'Svenska',
  tr: 'Türkçe',
  ko: '한국어',
  ca: 'català',
  et: 'Eesti',
  zf: '正體字',
}

export const replaceColorInBase64svg = (svg: string, toColor: string) => {
  const encoded = svg.replace('data:image/svg+xml;base64,', '')
  let decoded = atob(encoded)
  decoded = decoded.replace(/#000000/g, toColor)
  // @ts-ignore
  return 'data:image/svg+xml;base64,' + btoa(decoded)
}
