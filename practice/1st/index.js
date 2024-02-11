// 表單驗證規則
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
// 加入多國語系
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: false, // 調整為：輸入文字時，就立即進行驗證
});

//api參數
const apiUrl = 'https://ec-course-api.hexschool.io/v2';
const apiPath = 'ryanchiang13';

const app = Vue.createApp({
    data() {
        return {
            // 全部產品
            products: [],

            // 個別產品
            tempProduct: {},

            //狀態
            status: {
                addToCartLoading: '',
                adjustQtyLoading: '',
                removeCartsLoading: '',
            },

            // 購物車
            carts: {},

            //刪除購物車
            removeCarts: true,

            //表單
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message: '',
            }
        }
    },

    methods: {
        //產品列表
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then(res => {
                    this.products = res.data.products;
                })
        },

        //打開 Modal
        openModal(product) {
            this.tempProduct = product;
            this.$refs.productModal.open();
        },

        //購物車列表
        getCart() {
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
                .then(res => {
                    this.carts = res.data.data;
                })
        },

        // 加入購物車
        addToCart(product_id, qty = 1) { //參數預設值
            const order = {
                product_id,
                qty,
            };

            //把加入購物車產品id放進loading狀態
            this.status.addToCartLoading = product_id;

            axios.post(`${apiUrl}/api/${apiPath}/cart`, { data: order })
                .then(res => {

                    //成功加入後loading狀態就可以回復
                    this.status.addToCartLoading = '';

                    //提示訊息
                    alert(`${res.data.message}`);

                    // 關閉彈出視窗
                    this.$refs.productModal.close();

                    //更新購物車
                    this.getCart();
                })
        },

        //調整品項數量
        adjustQty(item, qty = 1) {
            const order = {
                product_id: item.product.id,
                qty,
            };

            //loading狀態
            this.status.adjustQtyLoading = item;

            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data: order })
                .then(res => {

                    //成功加入後loading狀態就可以回復
                    this.status.adjustQtyLoading = '';

                    //更新購物車
                    this.getCart();
                })
        },

        //刪除單一品項
        removeCartItem(item) {
            // 啟用loading
            this.status.adjustQtyLoading = item.id;

            axios.delete(`${apiUrl}/api/${apiPath}/cart/${item.id}`)
                .then(res => {

                    //成功加入後loading狀態就可以回復
                    this.status.adjustQtyLoading = '';

                    //提示訊息
                    alert(`${res.data.message}`);

                    //更新購物車
                    this.getCart();
                })
        },

        //刪除全部品項
        removeAllItem() {
            this.status.removeCartsLoading = this.removeCarts;

            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
                .then(res => {

                    //成功加入後loading狀態就可以回復
                    this.status.removeCartsLoading = '';

                    //提示訊息
                    alert(`${res.data.message}`);

                    //更新購物車
                    this.getCart();
                })
        },

        //送出表單
        onSubmit() {
            const order = this.form
            axios.post(`${apiUrl}/api/${apiPath}/order`, { data: order })
                .then(res => {
                    //提示訊息
                    alert(`${res.data.message}`);

                    //清空表單
                    this.$refs.form.resetForm();
                    this.form.message = '';

                    //更新購物車
                    this.getCart();

                    //跳轉
                    window.location='index.html'
                })
                .catch((err) => {
                    alert(err.response.data.message);
                });
        }
    },

    mounted() {
        this.getProducts();
        this.getCart();
    }
})

app.component('productModal', {
    props: ['tempProduct', 'openModal', 'addToCart', 'status'],
    template: '#userProductModal',
    data() {
        return {
            productModal: null,
            qty: 1,
        }
    },

    methods: {
        open() {
            this.productModal.show(); //bs語法
        },

        close() {
            this.productModal.hide(); //bs語法
        }
    },
    watch: {
        tempProduct() {
            //監測到數量變動後自動變回預設值1
            this.qty = 1;
        }
    },

    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal); //bs語法
    },
});
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');