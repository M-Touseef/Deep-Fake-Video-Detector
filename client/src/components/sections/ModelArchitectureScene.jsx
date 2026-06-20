import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const layers = [
  { name: 'Input Video', short: 'Frames', x: -9, color: 0x22d3ee, count: 4 },
  { name: 'Face Detection', short: 'Crops', x: -5.6, color: 0x38bdf8, count: 5 },
  { name: 'EfficientNet-B0', short: 'Spatial CNN', x: -2, color: 0xa78bfa, count: 7 },
  { name: 'Transformer', short: 'Temporal Encoder', x: 2, color: 0xfbbf24, count: 6 },
  { name: 'Classifier', short: 'Real / Fake', x: 5.7, color: 0x34d399, count: 4 },
  { name: 'Grad-CAM Report', short: 'Evidence', x: 9, color: 0xfb7185, count: 3 },
]

function makeTextTexture(text, options = {}) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const width = options.width || 512
  const height = options.height || 160
  canvas.width = width
  canvas.height = height
  context.clearRect(0, 0, width, height)
  context.font = `${options.weight || 800} ${options.size || 42}px Manrope, Arial, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = options.color || 'rgba(244,251,255,.96)'
  context.fillText(text, width / 2, height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeLabel(text, size = [1.9, 0.55], color = 'rgba(244,251,255,.96)') {
  const material = new THREE.SpriteMaterial({
    map: makeTextTexture(text, { color }),
    transparent: true,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(size[0], size[1], 1)
  return sprite
}

function makeHeatmapTexture() {
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const base = context.createLinearGradient(0, 0, size, size)
  base.addColorStop(0, '#061017')
  base.addColorStop(1, '#112a32')
  context.fillStyle = base
  context.fillRect(0, 0, size, size)

  const spots = [
    [138, 105, 82, 'rgba(251,191,36,.92)'],
    [105, 134, 70, 'rgba(248,113,113,.78)'],
    [166, 150, 64, 'rgba(34,211,238,.58)'],
  ]

  spots.forEach(([x, y, radius, color]) => {
    const gradient = context.createRadialGradient(x, y, 4, x, y, radius)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  })

  context.strokeStyle = 'rgba(244,251,255,.2)'
  context.lineWidth = 2
  context.strokeRect(22, 22, size - 44, size - 44)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createLine(start, end, color, opacity) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
  })
  return new THREE.Line(geometry, material)
}

function interpolatePath(points, progress) {
  const scaled = progress * (points.length - 1)
  const index = Math.min(Math.floor(scaled), points.length - 2)
  const local = scaled - index
  return new THREE.Vector3().lerpVectors(points[index], points[index + 1], local)
}

export default function ModelArchitectureScene({ activeStep = 0, isVisible = true }) {
  const canvasRef = useRef(null)
  const activeStepRef = useRef(activeStep)

  useEffect(() => {
    activeStepRef.current = activeStep
  }, [activeStep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 5.2, 17)

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const root = new THREE.Group()
    scene.add(root)

    const ambient = new THREE.AmbientLight(0x9bdff2, 1.35)
    scene.add(ambient)

    const keyLight = new THREE.PointLight(0x22d3ee, 34, 35)
    keyLight.position.set(-4, 5, 7)
    scene.add(keyLight)

    const warmLight = new THREE.PointLight(0xfb7185, 20, 30)
    warmLight.position.set(7, 3, 4)
    scene.add(warmLight)

    const layerGroups = []
    const nodePositions = []
    const labelSprites = []
    const connectionLines = []
    const layerMaterials = []

    layers.forEach((layer, layerIndex) => {
      const group = new THREE.Group()
      group.position.x = layer.x
      root.add(group)
      layerGroups.push(group)

      const title = makeLabel(layer.name, [2.2, 0.55])
      title.position.set(0, -2.35, 0)
      group.add(title)
      labelSprites.push(title)

      const subtitle = makeLabel(layer.short, [1.55, 0.42], 'rgba(145,165,173,.85)')
      subtitle.position.set(0, -2.85, 0)
      group.add(subtitle)
      labelSprites.push(subtitle)

      const nodes = []
      const count = layer.count
      for (let index = 0; index < count; index += 1) {
        const y = (index - (count - 1) / 2) * 0.58
        const z = Math.sin(index * 1.4 + layerIndex) * 0.28
        const material = new THREE.MeshStandardMaterial({
          color: layer.color,
          emissive: layer.color,
          emissiveIntensity: 0.42,
          roughness: 0.36,
          metalness: 0.45,
          transparent: true,
          opacity: 0.92,
        })
        layerMaterials.push(material)
        const geometry = layerIndex === 0 || layerIndex === layers.length - 1
          ? new THREE.BoxGeometry(1.08, 0.42, 0.08)
          : new THREE.SphereGeometry(0.18 + (layerIndex === 2 ? 0.03 : 0), 24, 16)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, y, z)
        mesh.userData.baseY = y
        mesh.userData.phase = layerIndex * 0.8 + index * 0.42
        group.add(mesh)
        nodes.push(mesh)
      }
      nodePositions.push(nodes)

      const shellMaterial = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
      const shell = new THREE.Mesh(new THREE.RingGeometry(1.06, 1.12, 64), shellMaterial)
      shell.rotation.x = Math.PI / 2
      shell.position.z = -0.08
      group.add(shell)
    })

    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex += 1) {
      const fromLayer = nodePositions[layerIndex]
      const toLayer = nodePositions[layerIndex + 1]
      fromLayer.forEach((fromNode, fromIndex) => {
        toLayer.forEach((toNode, toIndex) => {
          if ((fromIndex + toIndex + layerIndex) % 2 !== 0) return
          const start = fromNode.getWorldPosition(new THREE.Vector3())
          const end = toNode.getWorldPosition(new THREE.Vector3())
          const weight = 0.18 + (((fromIndex + 1) * (toIndex + 2) + layerIndex) % 6) * 0.08
          const line = createLine(start, end, layers[layerIndex + 1].color, weight)
          root.add(line)
          connectionLines.push(line)
        })
      })

      const weightLabel = makeLabel(`w=${(0.62 + layerIndex * 0.06).toFixed(2)}`, [1, 0.34], 'rgba(103,232,249,.9)')
      weightLabel.position.set((layers[layerIndex].x + layers[layerIndex + 1].x) / 2, 1.95 + (layerIndex % 2) * 0.42, 0.35)
      root.add(weightLabel)
      labelSprites.push(weightLabel)
    }

    const pathPoints = layers.map((layer, index) => new THREE.Vector3(layer.x, Math.sin(index * 0.8) * 0.45, 0.65))
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    })
    const particleGeometry = new THREE.SphereGeometry(0.07, 14, 10)
    const particles = Array.from({ length: 58 }, (_, index) => {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone())
      particle.userData.phase = index / 58
      particle.userData.speed = 0.055 + (index % 7) * 0.006
      particle.userData.offset = (index % 5 - 2) * 0.18
      root.add(particle)
      return particle
    })

    const heatmap = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 1.55),
      new THREE.MeshBasicMaterial({
        map: makeHeatmapTexture(),
        transparent: true,
        opacity: 0.94,
      }),
    )
    heatmap.position.set(9, 1.7, 0.36)
    heatmap.rotation.y = -0.18
    root.add(heatmap)

    const report = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.55, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0xeef7fa,
        emissive: 0x22d3ee,
        emissiveIntensity: 0.05,
        roughness: 0.45,
      }),
    )
    report.position.set(9.65, -0.15, -0.28)
    report.rotation.y = -0.35
    root.add(report)

    const resize = () => {
      const { clientWidth, clientHeight } = canvas
      renderer.setSize(clientWidth, clientHeight, false)
      camera.aspect = clientWidth / Math.max(clientHeight, 1)
      camera.position.z = clientWidth < 720 ? 23 : 17
      camera.position.y = clientWidth < 720 ? 6.3 : 5.2
      root.scale.setScalar(clientWidth < 720 ? 0.72 : clientWidth < 980 ? 0.86 : 1)
      camera.updateProjectionMatrix()
    }

    const handlePointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) || 0
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) || 0
      root.userData.pointerX = x
      root.userData.pointerY = y
    }

    const startedAt = performance.now()
    let frameId = 0

    const animate = () => {
      const elapsed = (performance.now() - startedAt) / 1000
      const activeLayer = Math.min(Math.max(activeStepRef.current, 0), layers.length - 1)
      root.rotation.y = Math.sin(elapsed * 0.25) * 0.08 + (root.userData.pointerX || 0) * 0.08
      root.rotation.x = -0.05 + (root.userData.pointerY || 0) * -0.05

      layerGroups.forEach((group, layerIndex) => {
        const emphasis = layerIndex === activeLayer || layerIndex === activeLayer + 1 ? 1 : 0
        group.position.y = Math.sin(elapsed * 1.1 + layerIndex) * 0.08 + emphasis * 0.12
        group.children.forEach((child) => {
          if (!child.isMesh || child.userData.baseY === undefined) return
          child.position.y = child.userData.baseY + Math.sin(elapsed * 2.2 + child.userData.phase) * 0.045
          child.scale.setScalar(1 + emphasis * 0.22 + Math.sin(elapsed * 2.5 + child.userData.phase) * 0.04)
          if (child.material?.emissiveIntensity !== undefined) child.material.emissiveIntensity = 0.38 + emphasis * 0.42
        })
      })

      connectionLines.forEach((line, index) => {
        line.material.opacity = 0.14 + Math.sin(elapsed * 2 + index) * 0.035 + (index % 5) * 0.018
      })

      particles.forEach((particle, index) => {
        const progress = (elapsed * particle.userData.speed + particle.userData.phase) % 1
        const point = interpolatePath(pathPoints, progress)
        particle.position.copy(point)
        particle.position.y += Math.sin(elapsed * 4 + index) * 0.25 + particle.userData.offset
        particle.position.z += Math.cos(elapsed * 3.2 + index) * 0.18
        particle.scale.setScalar(0.7 + Math.sin(progress * Math.PI) * 0.9)
        particle.material.opacity = 0.35 + Math.sin(progress * Math.PI) * 0.62
      })

      heatmap.rotation.z = Math.sin(elapsed * 0.8) * 0.08
      report.position.y = -0.15 + Math.sin(elapsed * 1.3) * 0.06

      renderer.render(scene, camera)
      if (isVisible) frameId = window.requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', handlePointerMove)
    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', handlePointerMove)
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => {
            if (material.map) material.map.dispose()
            material.dispose()
          })
        }
      })
      renderer.dispose()
    }
  }, [isVisible])

  return (
    <div className="relative h-[560px] w-full max-lg:h-[500px] max-md:h-[430px]" aria-label="Live 3D model architecture visualization">
      <canvas className="block size-full" ref={canvasRef} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071015] to-transparent" aria-hidden="true" />
    </div>
  )
}
