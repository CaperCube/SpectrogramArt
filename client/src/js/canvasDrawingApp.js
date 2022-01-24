// Audio vars
let sampleRate = 48000
let volMod = 0.5
let fft = module()

// Drawing app
function CanvasDrawingApp(props) {
    // Canvas vars
    this.canvas
    this.ctx
    this.bgColor
    this.shouldDrawBG = true

    // Path vars
    this.paths = []
    this.currentPath = []

    // Undo Vars
    this.UndonePaths = []
    this.maxUndos = 10

    // Brush vars
    this.brush // This should be an image eventually
    this.brushColor = "#ffffff"
    this.brushSize = 1

    // Internal system vars
    let pointerDown = false
    
    ////////////////////////////////////////
    // Initialization function (called at creation)
    ////////////////////////////////////////
    const Init = (props) => {
        const {
            canvas,
            width = 100,
            height = 100,
            background = "#00000000"
        } = props

        ////////////////////////////////////////
        // Initialize data members
        ////////////////////////////////////////
        this.bgColor = background
        this.canvas = canvas
        this.canvas.width = width
        this.canvas.height = height
        this.ctx = this.canvas.getContext('2d')

        ////////////////////////////////////////
        // Init the event listeners
        ////////////////////////////////////////
        this.canvas.addEventListener("touchstart", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointerdown", function(event) {
            event.preventDefault()
            onPointerDown(event)
        })
        // Move
        this.canvas.addEventListener("touchmove", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointermove", function(event) {
            event.preventDefault()
            onPointerDrag(event)
        })
        // Up
        this.canvas.addEventListener("touchend", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointerup", function(event) {
            event.preventDefault()
            onPointerUp(event)
        })
        // Cancel
        this.canvas.addEventListener("touchcancel", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointercancel", function(event) {
            event.preventDefault()
            onPointerUp(event)
        })

        // Do first frame render
        this.Render()
    }

    ////////////////////////////////////////
    // Render functions
    ////////////////////////////////////////

    // Draw a point as a circle
    const DrawRoundPoint = point => {
        //Set drawing color
        this.ctx.fillStyle = point.color

        // Draw Circle
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, point.size/2, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    // Draw a point as a soft circle
    const DrawSoftPoint = point => {
        //Create radial gradient brush
        const px = point.x
        const py = point.y
        let brushGrad = this.ctx.createRadialGradient(px, py, 0, px, py, point.size/2)
        brushGrad.addColorStop(0, point.color)
        brushGrad.addColorStop(1, "#FFFFFF00")

        // Draw Soft brush
        this.ctx.fillStyle = brushGrad
        this.ctx.fillRect(point.x - (point.size/2), point.y - (point.size/2), point.size, point.size)
    }

    // Draw a path as connected lines
    const DrawPath = path => {
        if (path?.length > 0) {
            // Begin path
            this.ctx.beginPath()
            this.ctx.lineCap = "round"
            this.ctx.lineJoin = "round"

            // Starting point
            this.ctx.lineWidth = path[0].size
            this.ctx.strokeStyle = path[0].color
            this.ctx.moveTo(path[0].x, path[0].y)

            // Connect the rest of the points
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y)
            }

            // Draw the path
            this.ctx.stroke()
        }
    }

    // Draw all paths and BG
    this.Render = () => {
        // Draw BG
        if (this.shouldDrawBG) {
            this.ctx.fillStyle = this.bgColor
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }

        // Draw the stored paths
        for (let i = 0; i < this.paths.length; i++) {
            DrawPath(this.paths[i])
        }

        // Draw current path
        DrawPath(this.currentPath)
    }

    ////////////////////////////////////////
    // Event functions
    ////////////////////////////////////////
    // Get the distance between two points (Unused)
    const GetDistance = (p1, p2) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    }

    // Create point for paths
    const CreatePoint = (point, lastPoint) => {
        // Create newest Point
        this.currentPath.push({
            x: point.x,
            y: point.y,
            color: this.brushColor,
            size: this.brushSize
        })

        // Render
        this.Render()
    }

    // Get pointerPos
    const GetPointerPos = event => {
        const rect = event.target.getBoundingClientRect()
        const offsetX = event.pageX - rect.left
        const offsetY = event.pageY - rect.top

        return {x: offsetX, y: offsetY}
    }

    // Start drawing
    const onPointerDown = event => {
        // Reset path and pointerDown
        pointerDown = true
        this.currentPath = []

        // Draw first point in path
        CreatePoint(GetPointerPos(event))
    }

    // Add to path
    const onPointerDrag = event => {
        // Save point in path
        if (pointerDown) {
            CreatePoint(GetPointerPos(event), this.currentPath[this.currentPath.length-1])
        }
    }

    // Stop drawing
    const onPointerUp = event => {
        // Push path into path array
        this.UndonePaths = []
        this.paths.push(this.currentPath)

        // Reset & Render
        this.currentPath = []
        pointerDown = false
        this.Render()
    }

    ////////////////////////////////////////
    // Public functions
    ////////////////////////////////////////
    // Move the newest path to the UndonePaths array
    this.Undo = () => {
        if (this.paths.length > 0 && this.paths.length < this.maxUndos) {
            this.UndonePaths.push(this.paths[this.paths.length-1])
            this.paths.splice(this.paths.length-1, 1)
            this.Render()
        }
    }

    // Move the newest UndonePaths array to the top of the path array
    this.Redo = () => {
        if (this.UndonePaths.length > 0) {
            this.paths.push(this.UndonePaths[this.UndonePaths.length-1])
            this.UndonePaths.splice(this.UndonePaths.length-1, 1)
            this.Render()
        }
    }

    // Clear all path arrays and re-render
    this.Clear = () => {
        this.paths = []
        this.UndonePaths = []
        this.Render()
    }

    // Expected input: 0 - 255
    this.SetOpacity = (val) => {
        // Calculate hex string
        const parsedInt = parseInt(val, 10)
        let hexNum = parsedInt.toString(16)
        if (hexNum.length < 2) hexNum = `0${hexNum}`
        
        // Set opacity
        this.brushColor = `#ffffff${hexNum}`
    }

    // ToDo: Move this function out of the drawing app and clean up
    // Creates an audio buffer from the canvas data
    this.ConvertAndPlay = (ctx) => {
        // We want to get the fft.inverse (or ifft?) of the dataBuffer, that should give us a correct drawing to audio buffer

        // Misc resources:
        // C# implementation from: https://www.codeproject.com/Articles/31935/Draw-into-sound
        // https://medium.datadriveninvestor.com/fourier-transform-for-image-processing-in-python-from-scratch-b96f68a6c30d
        // https://homepages.inf.ed.ac.uk/rbf/HIPR2/fourier.htm
        // https://climserv.ipsl.polytechnique.fr/documentation/idl_help/Transforming_Between_Domains_with_FFT.html

        ////////////////////////////////////////
        // Create an audio buffer from the canvas data
        ////////////////////////////////////////
        
        ////////////////////////////////////////
        // Create audio context
        ////////////////////////////////////////
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        //audioCtx.fftSize = 1024 //512, 256, 2048, 4096 data resolution

        ////////////////////////////////////////
        // Vars for img>sound converter
        ////////////////////////////////////////
        const seconds = ctx.canvas.width //ctx.canvas.width * audioCtx.fftSize
        //const numSamples = ctx.canvas.width //(canvas.width * audioCtx.fftSize) * canvas.height
        //let sampleArray = [] // This array length will go up to {numSamples} in length

        ////////////////////////////////////////
        // Create an empty monmo buffer at the sample rate of the AudioContext
        ////////////////////////////////////////
        // let myArrayBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate)
        //let myArrayBuffer = audioCtx.createBuffer(1, sampleRate * seconds, sampleRate)
        let myArrayBuffer = audioCtx.createBuffer(1, ctx.canvas.width * (ctx.canvas.height*2), sampleRate)
        var nowBuffering = myArrayBuffer.getChannelData(0) // Get the 0th channel for now
        let dataArray = [] // This will store the raw value of each pixel in its column

        ////////////////////////////////////////
        // Loop through all pixels and fill data
        ////////////////////////////////////////
        let w = 0 // A counter for the buffer array
        for (let i = 0; i < ctx.canvas.width; i++) {
            ////////////////////////////////////////
            // Reset data array
            // Trying to isolate the audible ranges of the canvas, the comments below seem to leave gaps in the final wave-form
            // Try having a blank canvas the size of this one to pull from as the top half of the data
            //
            // dataArray = new Array(ctx.canvas.height * 4).fill(0)
            // const freqOffset = (ctx.canvas.height * 3)
            ////////////////////////////////////////
            dataArray = new Array(ctx.canvas.height * 2).fill(0)
            const freqOffset = (ctx.canvas.height)
            // const freqOffset = 0

            ////////////////////////////////////////
            // Fill data array from image
            ////////////////////////////////////////
            for (let j = 0; j < ctx.canvas.height; j++)
            {
                let pixel = ctx.getImageData(i, j, 1, 1).data
                dataArray[j + freqOffset] = ((pixel[0] + pixel[1] + pixel[2]) / (255*3)) * volMod
            }
            // for (let j = 0; j < sampleRate/16; j++)
            // {
            //     const percentage = j/(sampleRate/16)
            //     const pixelY = Math.floor(percentage * ctx.canvas.height)
            //     let pixel = ctx.getImageData(i, pixelY, 1, 1).data
            //     dataArray[j + freqOffset] = (pixel[0] + pixel[1] + pixel[2]) / (255*3)
            // }

            ////////////////////////////////////////
            // Convert data
            ////////////////////////////////////////
            let convertedData = fft.fft(dataArray)
            //console.log(convertedData)

            ////////////////////////////////////////
            // Put data into audio buffer
            ////////////////////////////////////////
            for (let x = 0; x < convertedData.length; x++)
            {
                // Make sure the data is in the (-1 to 1) range
                nowBuffering[w] = ((convertedData[x][0] * 2) - 1)/2//(convertedData[x][0] * 2) - 1//convertedData[x][0]
                w++
            }
        }

        ////////////////////////////////////////
        // Create the clip and play
        ////////////////////////////////////////
        // Get an AudioBufferSourceNode
        // This is the AudioNode to use when we want to play an AudioBuffer
        var source = audioCtx.createBufferSource()
        // set the buffer in the AudioBufferSourceNode
        source.buffer = myArrayBuffer
        // connect the AudioBufferSourceNode to the destination so we can hear the sound
        source.connect(audioCtx.destination)
        // start the source playing
        source.start()

        ////////////////////////////////////////
        // Download the clip
        ////////////////////////////////////////
        //...
        // const b64Data = _arrayBufferToBase64(myArrayBuffer)
        // const exportedSound = CreateAudioElement(b64Data)
        // document.getElementById('song').appendChild(exportedSound)
        SaveWAV(myArrayBuffer)

        console.log("done")
    }

    ////////////////////////////////////////
    // Run the init function
    ////////////////////////////////////////
    Init(props)
}

// Create the canvas app
cApp = new CanvasDrawingApp({canvas: $("#draw_canvas"), width: 512, height: 256, background: "#000000"})