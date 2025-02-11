const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function checkQQBinding(qq, phone) {
    const url = `https://zy.xywlapi.cc/qqapi?qq=${qq}`;
    return axios.get(url)
        .then(response => {
            if (response.status === 200) {
                const data = response.data;
                if (data.status === 200 && data.phone === phone) {
                    console.log(`QQ号：${qq}，手机号：${phone}，核验成功`);
                    return true;
                } else {
                    console.log(`QQ号：${qq}，手机号：${phone}，核验失败`);
                    return false;
                }
            } else {
                console.log(`QQ号：${qq}，手机号：${phone}，接口调用失败，状态码：${response.status}`);
                return false;
            }
        })
        .catch(error => {
            console.error(`请求失败：${error}`);
            return false;
        });
}

function processPhone(qq, phone) {
    return checkQQBinding(qq, phone).then(result => {
        if (result) {
            return true;  // 返回True表示核验成功，可以停止其他线程
        }
        return false;  // 返回False表示核验失败，继续其他线程
    });
}

if (isMainThread) {
    const qq = process.argv[2];
    const phoneFilePath = process.argv[3];

    fs.readFile(phoneFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("文件未找到，请检查文件路径是否正确");
            return;
        }

        const phones = data.split('\n').map(phone => phone.trim());
        const workers = [];

        for (const phone of phones) {
            const worker = new Worker(__filename, {
                workerData: { qq, phone }
            });
            workers.push(worker);

            worker.on('message', result => {
                if (result) {
                    workers.forEach(w => w.terminate());
                }
            });
        }
    });
} else {
    const { qq, phone } = workerData;
    processPhone(qq, phone).then(result => {
        parentPort.postMessage(result);
    });
}
