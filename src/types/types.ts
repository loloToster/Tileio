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
    cells: SerializedCell[]
}

export interface Icon {
    title: string,
    slug: string,
    source: string,
    hex: hex
}
