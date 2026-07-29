import plantumlEncoder from 'plantuml-encoder'

const PLANTUML_ENDPOINT =
  process.env.PLANTUML_ENDPOINT || 'http://plantuml.infrastructure.svc:80'

/**
 * Renders a PlantUML source string and returns the raw SVG.
 * @param {string} source - The PlantUML source (including @startuml/@enduml)
 * @returns {Promise<string>} Raw SVG content
 */
export async function renderSvg(source) {
  const encoded = plantumlEncoder.encode(source)
  const url = `${PLANTUML_ENDPOINT}/svg/${encoded}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`PlantUML server responded with ${res.status}`)
  }

  return res.text()
}

/**
 * Renders a PlantUML source string and returns the raw PNG as a Buffer.
 * @param {string} source - The PlantUML source (including @startuml/@enduml)
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function renderPng(source) {
  const encoded = plantumlEncoder.encode(source)
  const url = `${PLANTUML_ENDPOINT}/png/${encoded}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`PlantUML server responded with ${res.status}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
