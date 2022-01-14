// We want to get the fft.inverse (or ifft?) of the dataBuffer, that should give us a correct drawing to audio buffer
// Misc resources:
// https://medium.datadriveninvestor.com/fourier-transform-for-image-processing-in-python-from-scratch-b96f68a6c30d
// https://homepages.inf.ed.ac.uk/rbf/HIPR2/fourier.htm
// https://climserv.ipsl.polytechnique.fr/documentation/idl_help/Transforming_Between_Domains_with_FFT.html

let fft = module()
console.log(fft)
function CanvasDrawingApp(props) {
    this.canvas
    this.ctx
    this.bgColor

    // Path vars
    this.paths = []
    this.currentPath = []

    // Undo Vars
    this.UndonePaths = []
    this.maxUndos = 10

    // Brush vars
    this.brush // This should be an image eventually
    this.brushColor = "#ffffff"
    this.brushSize = 5

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
        this.bgColor = background;
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

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
        });
        // Up
        this.canvas.addEventListener("touchend", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointerup", function(event) {
            event.preventDefault()
            onPointerUp(event)
        });
        // Cancel
        this.canvas.addEventListener("touchcancel", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointercancel", function(event) {
            event.preventDefault()
            onPointerUp(event)
        });

        // Do first frame render
        this.Render()
    }

    ////////////////////////////////////////
    // Render functions
    ////////////////////////////////////////
    // Draw point in path
    const DrawPoint = point => {
        //Set drawing color
        this.ctx.fillStyle = point.color

        // Draw shape
        // this.ctx.fillRect(point.x, point.y, point.size, point.size)
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, point.size/2, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    // Draw all paths
    this.Render = () => {
        this.ctx.fillStyle = this.bgColor
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw the stored paths
        for (let i = 0; i < this.paths.length; i++) {
            for (let j = 0; j < this.paths[i].length; j++) {
                DrawPoint(this.paths[i][j])
            }
        }

        // Draw current path
        if (this.currentPath) {
            for (let i = 0; i < this.currentPath.length; i++) {
                DrawPoint(this.currentPath[i])
            }
        }
    }

    ////////////////////////////////////////
    // Event functions
    ////////////////////////////////////////
    const GetDistance = (p1, p2) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    }

    // Create point for paths
    const CreatePoint = (point, lastPoint) => {
        // Create points to fill gaps
        if (false)//(lastPoint)
        {
            const distance = GetDistance(lastPoint, point)
            const averageSize = this.brushSize//(lastPoint.brushSize + this.brushSize)/2
            if (distance > averageSize/2) {
                // Fill gap
                const gapSteps = parseInt(distance / (averageSize/2), 10)
                console.log(gapSteps)
                for (let i = 0; i < gapSteps; i++) {
                    const xDif = point.x - lastPoint.x
                    const yDif = point.y - lastPoint.y

                    // Create newest Point
                    this.currentPath.push({
                        // x: lastPoint.x + xDif - (xDif/(i+1)),
                        // y: lastPoint.y + yDif - (yDif/(i+1)),
                        x: lastPoint.x + (Math.sin(distance/i) * xDif),
                        y: lastPoint.y + (Math.cos(distance/i) * yDif),
                        color: this.brushColor,
                        size: averageSize
                    })
                }
            }
        }

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
    this.Undo = () => {
        if (this.paths.length > 0 && this.paths.length < this.maxUndos) {
            this.UndonePaths.push(this.paths[this.paths.length-1])
            this.paths.splice(this.paths.length-1, 1)
            this.Render()
        }
    }

    this.Redo = () => {
        if (this.UndonePaths.length > 0) {
            this.paths.push(this.UndonePaths[this.UndonePaths.length-1])
            this.UndonePaths.splice(this.UndonePaths.length-1, 1)
            this.Render()
        }
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

    // Move this function out of the drawing app
    this.ConvertAndPlay = (ctx) => {
        // Create an audio buffer from the canvas data
        //...
        
        // Create audio context
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtx.fftSize = 256; //512, 256, 2048, 4096; data resolution

        // Vars for img>sound converter
        const seconds = ctx.canvas.width / audioCtx.fftSize //ctx.canvas.width * audioCtx.fftSize
        const numSamples = ctx.canvas.width * ctx.canvas.height //(canvas.width * audioCtx.fftSize) * canvas.height
        let sampleArray = [] // This array length will go up to {numSamples} in length

        // Create an empty three-second stereo buffer at the sample rate of the AudioContext
        let myArrayBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);
        var nowBuffering = myArrayBuffer.getChannelData(0); // Get the 0th channel for now
        let dataArray = [] // This will store the raw value of each pixel in its column

        // Loop through all pixels and fill data
        let w = 0; // A counter for the buffer array
        for (let i = 0; i < ctx.canvas.width; i++) {

            // Fill data array from image
            for (let j = 0; j < ctx.canvas.height; j++)
            {
                // Color C = InputBitmap.GetPixel(i,j);
                // data[j] = (C.R + C.G + C.B ) / 3;
                // var data = context.getImageData(x, y, 1, 1).data;
                // var rgb = [ data[0], data[1], data[2] ];
                let pixel = ctx.getImageData(i, j, 1, 1).data
                dataArray[j] = (pixel[0] + pixel[1] + pixel[2]) / (255*3)
                // dataArray[j] = []
                // dataArray[j][0] = (pixel[0] + pixel[1] + pixel[2]) / (255*3)
                // dataArray[j][1] = (pixel[0] + pixel[1] + pixel[2]) / (255*3)
                // normalize these values to be between 0 - 1
            }

            // Convert data
            // let convertedData = dataArray
            // console.log(dataArray)
            
            // console.log(fft.util.fftMag(dataArray))
            let convertedData = fft.fft(dataArray)
            //console.log(convertedData)

            // Put data into audio buffer
            for (let x = 0; x < convertedData.length; x++)
            {
                // Samples[w] = (byte)(MAX_DATA * data[x]);
                // or maybe
                // Samples[w] = (byte)( ((MAX_DATA * 2) * data[x]) - MAX_DATA );
                // w++;

                // const freq = Math.sin(w/(50))
                // const val = (freq) * 0.5
                // nowBuffering[w] = val
                // console.log(val)

                // Make sure the data is in the (-1 to 1) range
                nowBuffering[w] = ((convertedData[x][0] * 2) - 1)/2//(convertedData[x][0] * 2) - 1//convertedData[x][0]
                w++
            }
        }

        // Get an AudioBufferSourceNode.
        // This is the AudioNode to use when we want to play an AudioBuffer
        var source = audioCtx.createBufferSource()
        // set the buffer in the AudioBufferSourceNode
        source.buffer = myArrayBuffer
        // connect the AudioBufferSourceNode to the destination so we can hear the sound
        source.connect(audioCtx.destination)
        // start the source playing
        source.start()

        console.log("done")
    }

    ////////////////////////////////////////
    // Run the init function
    ////////////////////////////////////////
    Init(props)
}

// Move this to main.js or something
cApp = new CanvasDrawingApp({canvas: $("#draw_canvas"), width: 400, height: 256, background: "#000000"})
//256


/*
C# implementation from: https://www.codeproject.com/Articles/31935/Draw-into-sound

private const double MAX_DATA = +50;
        private const double MIN_DATA = -50;

        private const String NoInputBitmap = "No input bitmap";

        public Bitmap InputBitmap { get; set; }
        public WaveFile OutputWav { get; set; }

        public void Start()
        {
            int NumSamples = InputBitmap.Width * InputBitmap.Height;
            byte[] Samples = new byte[NumSamples];
            OutputWav = new WaveFile(1, 16, 44000);
            if (InputBitmap == null) throw new Exception(NoInputBitmap);
            double[] data = new double[InputBitmap.Height];

            int w = 0;
            for (int i = 0; i < InputBitmap.Width; i++) 
            {
                for (int j = 0; j < InputBitmap.Height; j++)
                {
                    Color C = InputBitmap.GetPixel(i,j);
                    data[j] = (C.R + C.G + C.B ) / 3;
                }

                FFT_Img2Wav.inverse(data);
                                
                for (int x = 0; x < data.Length; x++)
                {
                    Samples[w] = (byte)(MAX_DATA * data[x]);
                    // or maybe
                    // Samples[w] = (byte)( ((MAX_DATA * 2) * data[x]) - MAX_DATA );
                    w++;
                }
            }

            OutputWav.SetData(Samples,NumSamples);
        }
*/