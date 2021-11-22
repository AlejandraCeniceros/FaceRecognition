const imageUpload = document.getElementById('imageUlpload')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(start)

async function start(){
    const cotainer = document.createElement('div')
    container.style.postion = 'relative'
    document.body.append(container)
    const labeledFaceDescription = await loadLabeledImages()
    const faceMatcher = faceapi.faceMatcher(labeledFaceDescription, 0.6)
    let image
    let canvas
    document.body.append('Loaded')

    imageUpload.addEventListener('change', async () => {
        if (image) image.remove()
        if(canvas) canvas.remove()

        image = await faceapi.bufferToImage(imageUpload.file[0])
        container.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)

        const displaySize = {width: image.width, height: image.height}

        faceapi.matchDimensions(canvas, displaySize)

        const detection = await faceapi.detectAllFaces(image).widthFaceLandMarks().widthFaceDescriptors()
        const resizeDetections = faceapi.resizeResults(detection, displaySize)
        const results = resizeDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

        results.forEach((results, i) =>{
            const box = resizeDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {label: results.toString() })
            drawBox.draw(canvas)
        })
    })
}

function loadLabeledImages(){
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jime Rhodes', 'Thor', 'Tony Stark']
    return Promise.all
    (

        labels.map(async label => {
        const description = []
        for (let i = 1; i<= 2; i++) {
            const img = await faceapi.fetchImage('https://mawe.mx/face/images/${label}/${i}.jpg')
            const detections = await faceapi.detectionSingleFace(img).widthFaceLandmarks().widthFaceDescriptors()
            description.push(detections.description)

        }
     
        return new faceapi.labeledFaceDescription(label, description)
        })
    
    )
}