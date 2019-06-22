'use strict';

function printReceipt(inputs) {
    const goodsInfo = loadAllItems();
    const promotionInfo = loadPromotions();
    const countedGoods = countGoods(inputs);
    const originPriceList = getOriginPrice(countedGoods, goodsInfo);
    const promotionGoods = getPromotion(originPriceList, promotionInfo);
    const summary = getSummary(promotionGoods);
    print(promotionGoods, summary);
}

function countGoods(inputs) {
    const countedGoods = [];
    inputs.forEach(input => {
        const inputInfo = input.split('-');
        let code = input;
        let number = 1;
        if (inputInfo.length === 2) {
            code = inputInfo[0];
            number = Number(inputInfo[1]);
        }

        const findGood = countedGoods.find(good => good.code === code);
        if (findGood) {
            findGood.number += number;
        } else {
            countedGoods.push({
                code,
                number,
            });
        }
    });
    return countedGoods;
}

function getOriginPrice(countedGoods, goodsInfo) {
    const goods = [];
    countedGoods.forEach(item => {
        const findGood = goodsInfo.find(good => good.barcode === item.code);
        const number = item.number;
        const subtotal = findGood.price * number;
        goods.push(
            {
                ...findGood,
                number,
                subtotal,
            }
        );
    });
    return goods;
}

function getPromotion(originPriceList, promotionInfo) {
    return originPriceList.map(item => {
        // find 会返回找到的第一个
        const promo = (promotionInfo.find(promotion => promotion.barcodes.includes(item.barcode)) || {}).type;
        if (promo) {
            switch (promo) {
                case 'BUY_TWO_GET_ONE_FREE':
                    const discountPrice = item.number > 2 ? (item.number - 1) * item.price : item.subtotal;
                    return {
                        ...item,
                        discountPrice,
                    };
                default:
                    return {
                        ...item,
                        discountPrice: item.subtotal
                    };
            }
        } else {
            return {
                ...item,
                discountPrice: item.subtotal
            };
        }
    });
}

function getSummary(goods) {
    const totalPrices = goods.reduce((acc, good) => acc + good.discountPrice, 0).toFixed(2);
    const originPrices = goods.reduce((acc, good) => acc + good.subtotal, 0).toFixed(2);
    const discount = (originPrices - totalPrices).toFixed(2);
    return {
        totalPrices,
        discount,
    }
}

function print(goods, summary) {
    const head = '***<没钱赚商店>收据***\n';
    const goodInfoStr = goods.map(good => {
        const finalPrice = good.discountPrice.toFixed(2);
        return `名称：${good.name}，数量：${good.number}${good.unit}，单价：${good.price.toFixed(2)}(元)，小计：${finalPrice}(元)\n`;
    });
    const splitLine = '----------------------\n';
    const summaryStr = `总计：${summary.totalPrices}(元)\n节省：${summary.discount}(元)\n`;
    const end = '**********************';

    const printStr = head + goodInfoStr.join('') + splitLine + summaryStr + end;
    console.log(printStr);
}
