import type { CircuitJson, PcbBoard } from "circuit-json"
import type { Color } from "../types"

type Rgb = [number, number, number]

export interface BoardColorPalette {
  backgroundColor?: string
  boardSideColor?: string
  solderMaskWithCopperColor?: string
  silkscreenColor?: string
}

const BOARD_COLOR_PRESETS: Record<string, string> = {
  green: "#0f3812",
  red: "#8b1e1e",
  blue: "#173f68",
  purple: "#562b7c",
  black: "#111111",
  white: "#ffffff",
  yellow: "#d1a800",
  gray: "#808080",
  grey: "#808080",
}

const clampByte = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)))

const toHex = ([red, green, blue]: Rgb) =>
  `#${[red, green, blue]
    .map((channel) => clampByte(channel).toString(16).padStart(2, "0"))
    .join("")}`

const parseHexColor = (value: string): Rgb | undefined => {
  const hex = value.slice(1)
  if (hex.length === 3 || hex.length === 4) {
    return [
      Number.parseInt(`${hex[0]}${hex[0]}`, 16),
      Number.parseInt(`${hex[1]}${hex[1]}`, 16),
      Number.parseInt(`${hex[2]}${hex[2]}`, 16),
    ]
  }
  if (hex.length === 6 || hex.length === 8) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ]
  }
  return undefined
}

const parseRgbChannel = (value: string) =>
  value.endsWith("%")
    ? (Number.parseFloat(value) / 100) * 255
    : Number.parseFloat(value)

const parseRgbColor = (value: string): Rgb | undefined => {
  const match = value.match(/^rgba?\(([^)]+)\)$/i)
  if (!match) return undefined

  const channels = match[1]!
    .split(",")
    .slice(0, 3)
    .map((channel) => parseRgbChannel(channel.trim()))
  if (
    channels.length !== 3 ||
    channels.some((channel) => !Number.isFinite(channel))
  ) {
    return undefined
  }
  return channels.map(clampByte) as Rgb
}

const parseColor = (value: string): Rgb | undefined => {
  const normalized = value.trim().toLowerCase()
  const preset = BOARD_COLOR_PRESETS[normalized]
  const resolved = preset ?? normalized
  if (resolved.startsWith("#")) return parseHexColor(resolved)
  return parseRgbColor(resolved)
}

const normalizeColor = (value?: string) => {
  if (!value || value.trim().toLowerCase() === "not_specified") {
    return undefined
  }
  const parsed = parseColor(value)
  return parsed ? toHex(parsed) : value.trim()
}

const mix = (color: Rgb, target: Rgb, amount: number): Rgb =>
  color.map((channel, index) =>
    clampByte(channel + (target[index]! - channel) * amount),
  ) as Rgb

const getPerceivedBrightness = ([red, green, blue]: Rgb) =>
  (red * 0.299 + green * 0.587 + blue * 0.114) / 255

export const colorToCssString = (color: Color): string => {
  if (typeof color === "string") return color
  return toHex([color[0], color[1], color[2]])
}

export function deriveBoardColorPalette(
  solderMaskColor: string,
  silkscreenColor?: string,
): BoardColorPalette {
  const backgroundColor = normalizeColor(solderMaskColor)
  if (!backgroundColor) {
    return { silkscreenColor: normalizeColor(silkscreenColor) }
  }

  const maskRgb = parseColor(backgroundColor)
  if (!maskRgb) {
    return {
      backgroundColor,
      boardSideColor: backgroundColor,
      solderMaskWithCopperColor: backgroundColor,
      silkscreenColor: normalizeColor(silkscreenColor) ?? "#ffffff",
    }
  }

  const isLight = getPerceivedBrightness(maskRgb) >= 0.6
  const coveredCopper = mix(
    maskRgb,
    isLight ? [0, 0, 0] : [255, 255, 255],
    isLight ? 0.28 : 0.32,
  )
  const boardSide = mix(maskRgb, [0, 0, 0], isLight ? 0.14 : 0.24)

  return {
    backgroundColor: toHex(maskRgb),
    boardSideColor: toHex(boardSide),
    solderMaskWithCopperColor: toHex(coveredCopper),
    silkscreenColor:
      normalizeColor(silkscreenColor) ?? (isLight ? "#111827" : "#ffffff"),
  }
}

export function getBoardColorPalette(
  circuitJson: CircuitJson,
  overrides: {
    solderMaskColor?: string
    silkscreenColor?: string
  } = {},
): BoardColorPalette {
  const board = circuitJson.find(
    (element): element is PcbBoard => element.type === "pcb_board",
  )
  const legacyBoard = board as
    | (PcbBoard & { soldermask_color?: string })
    | undefined
  const solderMaskColor =
    overrides.solderMaskColor ??
    board?.solder_mask_color ??
    legacyBoard?.soldermask_color
  const silkscreenColor = overrides.silkscreenColor ?? board?.silkscreen_color

  if (!solderMaskColor) {
    return { silkscreenColor: normalizeColor(silkscreenColor) }
  }
  return deriveBoardColorPalette(solderMaskColor, silkscreenColor)
}
