"use client"

import { useEffect, useRef } from "react"

export function AnimatedITBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Animation variables
    let animationFrameId: number
    let time = 0

    // IT Infrastructure positions (responsive)
    const getPositions = () => {
      const width = canvas.width
      const height = canvas.height
      return {
        server: { x: width * 0.1, y: height * 0.5 },
        firewall: { x: width * 0.3, y: height * 0.5 },
        switch: { x: width * 0.5, y: height * 0.5 },
        accessPoint: { x: width * 0.7, y: height * 0.5 },
        endpoint: { x: width * 0.9, y: height * 0.5 },
      }
    }

    // WiFi ripple class
    class WiFiRipple {
      x: number
      y: number
      radius: number
      maxRadius: number
      opacity: number
      speed: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = 0
        this.maxRadius = 80
        this.opacity = 1
        this.speed = 1.5
      }

      update() {
        this.radius += this.speed
        this.opacity = 1 - this.radius / this.maxRadius

        if (this.radius >= this.maxRadius) {
          this.radius = 0
          this.opacity = 1
        }
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity * 0.6
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }

    // Data packet class
    class DataPacket {
      startX: number
      startY: number
      endX: number
      endY: number
      x: number
      y: number
      progress: number
      speed: number
      color: string

      constructor(startX: number, startY: number, endX: number, endY: number) {
        this.startX = startX
        this.startY = startY
        this.endX = endX
        this.endY = endY
        this.x = startX
        this.y = startY
        this.progress = 0
        this.speed = 0.02
        this.color = "#10b981"
      }

      update() {
        this.progress += this.speed
        if (this.progress >= 1) {
          this.progress = 0
        }

        this.x = this.startX + (this.endX - this.startX) * this.progress
        this.y = this.startY + (this.endY - this.startY) * this.progress
      }

      draw() {
        ctx.save()
        ctx.fillStyle = this.color
        ctx.shadowColor = this.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Initialize WiFi ripples
    const wifiRipples: WiFiRipple[] = []
    const dataPackets: DataPacket[] = []

    const initializeElements = () => {
      const positions = getPositions()

      // Create WiFi ripples
      wifiRipples.length = 0
      for (let i = 0; i < 3; i++) {
        wifiRipples.push(new WiFiRipple(positions.accessPoint.x, positions.accessPoint.y))
      }

      // Create data packets
      dataPackets.length = 0
      dataPackets.push(
        new DataPacket(positions.server.x, positions.server.y, positions.firewall.x, positions.firewall.y),
      )
      dataPackets.push(
        new DataPacket(positions.firewall.x, positions.firewall.y, positions.switch.x, positions.switch.y),
      )
      dataPackets.push(
        new DataPacket(positions.switch.x, positions.switch.y, positions.accessPoint.x, positions.accessPoint.y),
      )
    }

    initializeElements()

    // Draw IT device
    const drawDevice = (x: number, y: number, type: string, color: string) => {
      ctx.save()
      ctx.fillStyle = color
      ctx.strokeStyle = "#1f2937"
      ctx.lineWidth = 2

      switch (type) {
        case "server":
          // Server rack
          ctx.fillRect(x - 15, y - 20, 30, 40)
          ctx.strokeRect(x - 15, y - 20, 30, 40)
          // Server lights
          ctx.fillStyle = "#10b981"
          ctx.fillRect(x - 10, y - 15, 4, 4)
          ctx.fillRect(x - 10, y - 8, 4, 4)
          ctx.fillRect(x - 10, y - 1, 4, 4)
          break

        case "firewall":
          // Firewall box
          ctx.fillRect(x - 12, y - 15, 24, 30)
          ctx.strokeRect(x - 12, y - 15, 24, 30)
          // Firewall shield symbol
          ctx.fillStyle = "#ef4444"
          ctx.beginPath()
          ctx.moveTo(x, y - 8)
          ctx.lineTo(x - 6, y + 2)
          ctx.lineTo(x, y + 8)
          ctx.lineTo(x + 6, y + 2)
          ctx.closePath()
          ctx.fill()
          break

        case "switch":
          // Network switch
          ctx.fillRect(x - 18, y - 8, 36, 16)
          ctx.strokeRect(x - 18, y - 8, 36, 16)
          // Ports
          ctx.fillStyle = "#1f2937"
          for (let i = 0; i < 6; i++) {
            ctx.fillRect(x - 15 + i * 5, y - 4, 3, 8)
          }
          break

        case "accesspoint":
          // Access Point
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          // WiFi symbol
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath()
            ctx.arc(x, y, i * 4, -Math.PI * 0.7, -Math.PI * 0.3)
            ctx.stroke()
          }
          break

        case "endpoint":
          // Laptop/endpoint
          ctx.fillRect(x - 10, y - 8, 20, 16)
          ctx.strokeRect(x - 10, y - 8, 20, 16)
          // Screen
          ctx.fillStyle = "#1f2937"
          ctx.fillRect(x - 8, y - 6, 16, 10)
          break
      }
      ctx.restore()
    }

    // Draw connection line
    const drawConnection = (x1: number, y1: number, x2: number, y2: number, animated = false) => {
      ctx.save()
      ctx.strokeStyle = animated ? "#3b82f6" : "#6b7280"
      ctx.lineWidth = 2

      if (animated) {
        ctx.shadowColor = "#3b82f6"
        ctx.shadowBlur = 5
        ctx.setLineDash([5, 5])
        ctx.lineDashOffset = -time * 0.1
      }

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.restore()
    }

    // Draw background grid
    const drawGrid = () => {
      ctx.save()
      ctx.strokeStyle = "#f3f4f6"
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3

      const gridSize = 50
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      time += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#f8fafc")
      gradient.addColorStop(0.5, "#f1f5f9")
      gradient.addColorStop(1, "#e2e8f0")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      drawGrid()

      const positions = getPositions()

      // Draw connections
      drawConnection(positions.server.x + 15, positions.server.y, positions.firewall.x - 12, positions.firewall.y, true)
      drawConnection(positions.firewall.x + 12, positions.firewall.y, positions.switch.x - 18, positions.switch.y, true)
      drawConnection(
        positions.switch.x + 18,
        positions.switch.y,
        positions.accessPoint.x - 12,
        positions.accessPoint.y,
        true,
      )
      drawConnection(
        positions.accessPoint.x + 12,
        positions.accessPoint.y,
        positions.endpoint.x - 10,
        positions.endpoint.y,
      )

      // Update and draw WiFi ripples
      wifiRipples.forEach((ripple, index) => {
        ripple.update()
        ripple.draw()

        // Stagger the ripples
        if (index === 1) ripple.radius += 0.3
        if (index === 2) ripple.radius += 0.6
      })

      // Update and draw data packets
      dataPackets.forEach((packet) => {
        packet.update()
        packet.draw()
      })

      // Draw IT devices
      drawDevice(positions.server.x, positions.server.y, "server", "#64748b")
      drawDevice(positions.firewall.x, positions.firewall.y, "firewall", "#f59e0b")
      drawDevice(positions.switch.x, positions.switch.y, "switch", "#8b5cf6")
      drawDevice(positions.accessPoint.x, positions.accessPoint.y, "accesspoint", "#3b82f6")
      drawDevice(positions.endpoint.x, positions.endpoint.y, "endpoint", "#10b981")

      // Draw labels
      ctx.save()
      ctx.fillStyle = "#374151"
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"

      ctx.fillText("Server", positions.server.x, positions.server.y + 35)
      ctx.fillText("Firewall", positions.firewall.x, positions.firewall.y + 35)
      ctx.fillText("Switch", positions.switch.x, positions.switch.y + 35)
      ctx.fillText("Access Point", positions.accessPoint.x, positions.accessPoint.y + 35)
      ctx.fillText("Endpoint", positions.endpoint.x, positions.endpoint.y + 35)

      ctx.restore()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)" }}
    />
  )
}
