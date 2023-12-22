import axios from 'axios';
import { launch } from 'puppeteer';
import { Items, Size } from './interfaces/basicInterfaces';
import { BASE_LINK, DATA_REQUEST, WAREHOUSES } from './config';

/* User-input mock */
const ProductID = 146972802;
const WarehouseName = 'Казань WB'

/* Главная функция */
async function getStock() {

    /* Создание инстанса браузера */
    const browser = await launch({
        headless: false,
    });

    let page = await browser.newPage();

    await page.goto(BASE_LINK + ProductID + '/detail.aspx', {
        waitUntil: 'networkidle0',
        timeout: 0
    })

    /** ID товаров */
    const colors = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".slider-color .img-plug")).map((item) => item.getAttribute('href')?.replace(/https:\/\/www.wildberries.ru\/catalog\//, '').replace(/\/detail.aspx/, ''));
    });

    /** ID нужного склада */
    const storeId: string = await axios.get(WAREHOUSES).then((res) => res.data.find((store: any) => store.name === WarehouseName).id)

    /* Получить данные о товарах (функцию getProductData можно вынести отдельно и использовать потом)*/
    async function getProductData(color: string){
        return await axios.get(DATA_REQUEST + color);
    }

    const results = await Promise.all(
        colors.map((color) => getProductData(color || ""))
    );

    const result: Items[] = []

    /* Формирование массива объектов для результата*/
    results.map((res) => {
        const response = res.data.data.products[0];
        const sizes: Size[] = response.sizes

        if (sizes && sizes.length > 0) {
            const stock: any = {}
            sizes.map((size: any) => {
                const qty = size.stocks.find((store: any) => store.wh === storeId)
                if (qty) stock[size.origName] = qty.qty
            })

            if (stock) {
                result.push({'art': response.id, 'stock': stock})
            }
        }
    })

    return result
}

/* Запуск приложения */

getStock().then(res => {console.log(res)})