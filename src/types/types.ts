import { calendar_v3 } from "@googleapis/calendar"

export type hex = string

export interface SerializedLinkCellContent {
    type: "l",
    iconUrl: string,
    bgColor?: string,
    link: string
}

export interface SerializedDynamicCellContent {
    type: "d",
    src: string
}

export type SerializedCellContent = SerializedLinkCellContent | SerializedDynamicCellContent

export interface SerializedCell {
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    content?: SerializedCellContent
}

export interface Grid {
    col: number,
    row: number,
    bg?: string,
    cell?: string,
    cells: SerializedCell[]
}

export interface SIIcon {
    title: string,
    slug: string,
    source: string,
    hex: hex
}

export interface FAIcon {
    name: string
}

export interface IconResponse {
    si: SIIcon[],
    fa: FAIcon[]
}

export interface CalendarResponse {
    calendars: calendar_v3.Schema$CalendarListEntry[],
    events: calendar_v3.Schema$Event[]
}
