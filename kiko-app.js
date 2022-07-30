(function () {
    if (!(window.location.host).includes('kikocosmetics'))
        return alert('Необхідно перейти на адресу https://www.kikocosmetics.com/en-gb/ та повторити дію')

    const templateId = 'kiko-extension'
    window.kikoProductName = document.querySelector('.ProductDetails__Title').innerText;
    window.kikoProductCategory = document.querySelector('.Breadcrumbs ').innerText;
    window.kikoExtensionRunning = !window.kikoExtensionRunning;
    console.log(window.kikoExtensionRunning ? 'running' : 'stopped')
    window.kikoImages = [];
    window.kikoShades = [];

    function downloadTextFile(filename, text) {
        console.log(filename, text)
        const anchor = document.createElement('a');
        anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        alert('Завантаження завершено!');
    }


    function createStyles() {
        const style = document.createElement('style');
        style.textContent = `
        #kiko-extension {
            text-align: center;
            position: fixed;
            z-index: 1024; 
            bottom: 16px;   
            left: 16px; 
            background: #212121; 
            border-radius: 8px; 
            display: flex; 
            flex-direction: column;
            padding: 8px;
        }
        #kiko-extension > button {
            color: #fff; 
            font-size: 16px;
            border: 1px solid #fec503;
             border-radius: 8px;
            padding: 10px 40px;
            margin: 4px
        }
        
        #kiko-extension > button:hover{
            text-decoration: underline;
        }
        #kiko-extension > #progress {
            color: #fec503;
            font-size: 12px;
            margin: 4px
        }
        `;
        document.head.appendChild(style);
        console.log('Styles attached!')
    }

    createStyles();


    function uninstall() {
        window.kikoExtensionRunning = false;
        document.querySelector('#' + templateId)?.remove();
        console.log('Uninstalled!')
    }

    async function downloadImages() {
        try {
            const content = await findImages();
            const productName = window.kikoProductName;
            const category = window.kikoProductCategory;
            const type = 'images'
            const json = JSON.stringify({productName, category, type, content}, null, 2);
            downloadTextFile('Зображення ' + productName, json);
        } catch (e) {
            console.log(e);
        }
    }

    async function downloadShades() {
        try {
            const category = window.kikoProductCategory;
            const productName = window.kikoProductName;
            const content = window.kikoShades;
            const type = 'shades'
            const json = JSON.stringify({productName, category, type, content}, null, 2);
            downloadTextFile('Відтінки ' + productName, json)
        } catch (e) {
            console.log(e);
        }
    }

    // async function downloadAll(name = '') {
    //     try {
    //         const name = window.kikoProductName;
    //         const json = JSON.stringify([...window.kikoImages, ...window.kikoShades], null, 2);
    //         downloadTextFile('Усі зображення ' + name, json)
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    function findShades() {
        try {
            const allShades = document.querySelector('#all-shades');
            const allShadeButtons = allShades.querySelectorAll('.js-shade');
            const foundShades = []
            allShadeButtons.forEach(shade => {
                const name = shade.dataset.name;
                const span = shade.querySelector('span');
                const src = makeItUrl(span.style.backgroundImage);
                foundShades.push({
                    name,
                    src
                })
            })
            window.kikoShades = foundShades;
        } catch (e) {
            console.error(e)
        }
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    function makeItUrl(badSrc) {
        let url = badSrc.split('#')[0];
        url = url.replace('url', '').replace('(', '').replace(')', '').replace('"', '').replace("'", '');
        if (!url.includes('https:'))
            url = 'https:' + url
        return url
    }

    async function findImages() {
        try {
            const images = []
            const dropDown = document.querySelector('.Dropdown__List');
            const availableShadeButtons = dropDown.querySelectorAll('.js-shade-dropdown-option');

            for (let i = 0; i < availableShadeButtons.length; i++) {
                const sameShadeImages = []
                const btn = availableShadeButtons[i];
                const name = btn.innerText;
                btn.click();
                window.kikoProgress = `${i + 1}/${availableShadeButtons.length}`;
                await delay(1000);
                console.log(777, 'resume')
                const zoomImg = document.querySelectorAll('.zoomImg');
                zoomImg.forEach(img => {
                    const src = makeItUrl(img.src);
                    sameShadeImages.push(src)
                })
                images.push({
                    name,
                    src: sameShadeImages
                })
            }
            return images
        } catch (e) {
            console.error(e)
        }
    }

    function findProductImages() {
        if (!window.kikoExtensionRunning)
            return;
        try {
            const template = `
                <div id="${templateId}">
                    <button id="kiko-images">Завантажити зображення</button>
                    <button id="kiko-shades">Завантажити відтінки (${window.kikoShades?.length || 0})</button>
                    <div id="progress">${window.kikoProgress ? "Прогрес: " + window.kikoProgress : ''}</div>
                </div>`
            document.querySelector('#' + templateId)?.remove();
            document.body.insertAdjacentHTML('beforeend', template);

            document.querySelector('#kiko-images').addEventListener('click', downloadImages)
            document.querySelector('#kiko-shades').addEventListener('click', downloadShades)
            // document.querySelector('#kiko-all').addEventListener('click', downloadAll)
            findShades();

        } catch (e) {
            console.error(e)
        }
        if (window.kikoExtensionRunning)
            setTimeout(findProductImages, 500);
        else
            uninstall()
    }

    findProductImages()
})()
