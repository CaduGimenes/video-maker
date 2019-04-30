const imgUrlBlackList = require('./blacklist.json').imageUrlBlackList
const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentiasls = require('../credentials/google-search.json')
async function robot() {
    const content = state.load()

    //await fetchImagesOfAllSentences(content)
    //await downloadAllImages(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnimageLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnimageLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentiasls.apiKey,
            cx: googleSearchCredentiasls.searchEngineId,
            q: query,
            searchType: 'image',
            imgSize: 'huge',
            num: 3
        })

        const imageUrl = response.data.items.map((item => {
            return item.link
        }))

        return imageUrl
    }

    async function downloadAllImages(content) {
        content.downloadedImages = []

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex]

                try {

                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error('> A imagem já foi baixada')
                    }

                    if (imgUrlBlackList.includes(imageUrl)){
                        throw new Error('> Imagem está na black list')
                    }

                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.jpg`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`> [${sentenceIndex}][${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
                    break
                } catch (error) {
                    console.log(`> [${sentenceIndex}][${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(url, fileName) {
        return imageDownloader.image({
            url,
            dest: `./content/${fileName}`
        })
    }

}

module.exports = robot