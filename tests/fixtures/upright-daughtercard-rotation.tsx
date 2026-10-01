export const m2SocketUrl =
  "https://raw.githubusercontent.com/Kmshanley/PicoSat-Initiative/9b3e0e6cb27fabb48df7f36363ebddf051e3932b/Hardware/OBC-Flight_Rev0/Parts/MDT350M01401VT/MDT350M01401VT.stp"

const m2InsertionHeight = 2.839
const m2OddPins = Array.from(
  { length: 38 },
  (_, index) => 2 * index + 1,
).filter((pin) => pin < 59 || pin > 66)
const m2EvenPins = Array.from(
  { length: 37 },
  (_, index) => 2 * index + 2,
).filter((pin) => pin < 59 || pin > 66)

const SocketLand = ({ pin, x, y }: { pin: number; x: number; y: number }) => (
  <smtpad
    portHints={[`pin${pin}`]}
    layer="top"
    shape="rect"
    width={1.375}
    height={0.3}
    pcbX={x}
    pcbY={y}
  />
)

const M2SocketFootprint = () => (
  <footprint>
    {m2OddPins.map((pin) => (
      <SocketLand
        key={pin}
        pin={pin}
        x={1.3125}
        y={9.25 - ((pin - 1) / 2) * 0.5}
      />
    ))}
    {m2EvenPins.map((pin) => (
      <SocketLand
        key={pin}
        pin={pin}
        x={-1.3125}
        y={9 - ((pin - 2) / 2) * 0.5}
      />
    ))}
    <smtpad
      portHints={["mount1"]}
      layer="top"
      shape="rect"
      width={2.75}
      height={1.2}
      pcbX={0.55}
      pcbY={-11.45}
    />
    <smtpad
      portHints={["mount2"]}
      layer="top"
      shape="rect"
      width={2.75}
      height={1.2}
      pcbX={0.55}
      pcbY={11.45}
    />
    <hole diameter={1.6} pcbX={0} pcbY={-10} />
    <hole diameter={1.1} pcbX={0} pcbY={10} />
  </footprint>
)

const keyNotch = [
  { x: -12.1, y: 5.525 },
  ...Array.from({ length: 17 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * index) / 16
    return {
      x: -9.1 + 0.6 * Math.cos(angle),
      y: 6.125 + 0.6 * Math.sin(angle),
    }
  }),
  { x: -12.1, y: 6.725 },
]

const EdgeContact = ({
  pin,
  layer,
  y,
}: {
  pin: number
  layer: "top" | "bottom"
  y: number
}) => (
  <smtpad
    portHints={[`pin${pin}`]}
    layer={layer}
    shape="rect"
    width={1.5}
    height={0.35}
    pcbX={-10.75}
    pcbY={y}
  />
)

const goldContact = (y: number, z: number) => ({
  type: "translate",
  vector: [-10.75, y, z],
  shape: { type: "cuboid", size: [1.5, 0.35, 0.04] },
})

const edgeContactModel = {
  type: "union",
  shapes: [
    ...m2OddPins.map((pin) => goldContact(-9.25 + ((pin - 1) / 2) * 0.5, 0.43)),
    ...m2EvenPins.map((pin) => goldContact(-9 + ((pin - 2) / 2) * 0.5, -0.43)),
  ],
}

export const createDaughtercard = () => (
  <board
    width={24}
    height={22}
    thickness={0.8}
    solderMaskColor="blue"
    routingDisabled
    schematicDisabled
    outline={[
      { x: -12, y: -9.925 },
      { x: -8.5, y: -9.925 },
      { x: -8.5, y: -11 },
      { x: 12, y: -11 },
      { x: 12, y: 11 },
      { x: -8.5, y: 11 },
      { x: -8.5, y: 9.925 },
      { x: -12, y: 9.925 },
    ]}
  >
    <cutout shape="polygon" points={keyNotch} />
    <chip
      name="EDGE1"
      pcbX={0}
      pcbY={0}
      pcbRotation={0}
      cadModel={{
        jscad: edgeContactModel,
        modelOriginPosition: { x: -10.75, y: 0, z: 0.4 },
      }}
      footprint={
        <footprint>
          {m2OddPins.map((pin) => (
            <EdgeContact
              key={pin}
              pin={pin}
              layer="top"
              y={-9.25 + ((pin - 1) / 2) * 0.5}
            />
          ))}
          {m2EvenPins.map((pin) => (
            <EdgeContact
              key={pin}
              pin={pin}
              layer="bottom"
              y={-9 + ((pin - 2) / 2) * 0.5}
            />
          ))}
        </footprint>
      }
    />
    <chip name="U1" footprint="soic8" pcbX={2} pcbY={2} />
    <resistor name="R1" resistance="1k" footprint="0805" pcbX={6} pcbY={-6} />
    <silkscreentext text="M KEY / 0.8mm" pcbX={6} pcbY={6} fontSize={1} />
  </board>
)

export const createDaughtercardCarrier = ({
  daughtercardGlbUrl,
  rotationY,
}: {
  daughtercardGlbUrl: string
  rotationY: number
}) => (
  <board
    width={36}
    height={30}
    thickness={1.4}
    routingDisabled
    schematicDisabled
  >
    <chip
      name="SOCKET1"
      pcbX={0}
      pcbY={0}
      pcbRotation={0}
      manufacturerPartNumber="MDT350M01401VT"
      footprint={<M2SocketFootprint />}
      cadModel={{
        stepUrl: m2SocketUrl,
        modelBoardNormalDirection: "y+",
        modelOriginPosition: { x: 0, y: 0, z: 0 },
        rotationOffset: { x: 0, y: 0, z: 90 },
      }}
    />
    <chip
      name="CARD1"
      pcbX={0}
      pcbY={0}
      pcbRotation={0}
      cadModel={{
        glbUrl: daughtercardGlbUrl,
        modelBoardNormalDirection: "y+",
        modelOriginPosition: { x: 12, y: 0, z: 0 },
        rotationOffset: { x: 0, y: rotationY, z: 0 },
        positionOffset: { x: 0, y: 0, z: m2InsertionHeight },
      }}
    />
    <resistor name="R2" resistance="1k" footprint="0805" pcbX={10} pcbY={-8} />
  </board>
)
