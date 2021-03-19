import {
  Direction,
  DirectionMode,
  MapwizeApi,
  MapwizeObject,
  Place,
  Placelist,
  PlacePreview,
  SearchParams,
  Venue,
} from 'mapwize-sdk-react-native'

export interface ApiServiceOptions {
  restrictContentToOrganizationId?: string
  restrictContentToVenueId?: string
  restrictContentToVenueIds?: string[]
}

export class ApiService {
  private options: ApiServiceOptions
  private mapwizeApi: MapwizeApi

  constructor(options: ApiServiceOptions, mapwizeApi: MapwizeApi) {
    this.options = options
    this.mapwizeApi = mapwizeApi
  }

  public async search(searchParamsJS: any) {
    //Compatibility work around with js store
    const searchParamsRN = {
      ...searchParamsJS,
      objectClass: 'SearchParams',
    }
    return this.mapwizeApi?.search(
      this.mergeSearchParams(searchParamsRN, this.options)
    )
  }

  public async getMainSearches(venue?: Venue) {
    return venue && this.mapwizeApi?.getMainSearches(venue)
  }

  public async getMainFroms(venue?: Venue) {
    return venue && this.mapwizeApi?.getMainFroms(venue)
  }

  public async getPlace(place: PlacePreview) {
    return this.mapwizeApi?.getPlace(place._id)
  }
  public async getPlaceWithId(placeId: string) {
    return this.mapwizeApi?.getPlace(placeId)
  }
  public async getPlaceDetails(place: PlacePreview) {
    return this.mapwizeApi?.getPlaceDetails(place._id)
  }
  public async getPlaceDetailsWithId(placeId: string) {
    return this.mapwizeApi?.getPlaceDetails(placeId)
  }

  public async getDirection(directionParams: any) {
    let from = { ...directionParams?.from }
    let to = { ...directionParams?.to }
    if (directionParams?.from?.objectClass === 'PlaceDetails') {
      from = await this.mapwizeApi?.getPlace(from._id)
    }
    if (directionParams?.to?.objectClass === 'PlaceDetails') {
      to = await this.mapwizeApi?.getPlace(to._id)
    }
    return this.mapwizeApi?.getDirection(from, to, directionParams.mode) //TODO check direction options
  }

  public async getPlacelist(placelist: PlacePreview) {
    return this.mapwizeApi?.getPlacelist(placelist._id)
  }
  public async getPlacesForPlacelist(placelist: Placelist) {
    return this.mapwizeApi?.getPlacesForPlacelist(placelist)
  }

  mergeSearchParams(seachParams: any, options: ApiServiceOptions): any {
    const merged = {
      ...seachParams,
    }
    if (options.restrictContentToVenueId) {
      merged.venueId = options.restrictContentToVenueId
    }
    if (options.restrictContentToVenueIds) {
      merged.venueIds = options.restrictContentToVenueIds
    }
    if (options.restrictContentToOrganizationId) {
      merged.organizationId = options.restrictContentToOrganizationId
    }
    return merged
  }
}
