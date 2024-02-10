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

const apiUrl = 'https://ec-course-api.hexschool.io/v2';
const apiPath = 'ryanchiang13';

const app = Vue.createApp({

    data() {
        return {
            //產品列表
            products: [],

            //選定產品
            tempProduct: {},

            // loading 狀態
            status: {
                addToCartLoading: '',
                adjustQtyLoading: '',
                removeAllLoding: '',
            },

            // 購物車
            carts: {},

            // 表單
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
        //取得資料
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then(res => {
                    this.products = res.data.products;
                })
        },

        // 打開視窗
        openModal(product) {
            this.tempProduct = product;
            this.$refs.userModal.open();
        },


        //加入購物車
        addToCart(product_id, qty = 1) { //參數預設值
            //post 的 order 參數
            const order = {
                product_id,
                qty
            };

            // 啟用loading
            this.status.addToCartLoading = product_id;

            axios.post(`${apiUrl}/api/${apiPath}/cart`, { data: order })
                .then(res => {
                    // 清空loading狀態
                    this.status.addToCartLoading = '';

                    // 關閉彈出視窗
                    this.$refs.userModal.close();

                    //更新購物車
                    this.getCart();
                })
        },

        //取得購物車
        getCart() {
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
                .then(res => {
                    this.carts = res.data.data;
                })
        },

        //調整購物車數量
        adjustQty(item, qty = 1) {
            //put 的 order 參數
            const order = {
                product_id: item.product_id,
                qty,
            };

            // 啟用loading
            this.status.adjustQtyLoading = item.id;

            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data: order })
                .then(res => {

                    // 清空loading狀態
                    this.status.adjustQtyLoading = '';

                    //更新購物車
                    this.getCart();

                })
        },

        //刪除個別購物車品項
        removeCartItem(item) {
            // 啟用loading
            this.status.adjustQtyLoading = item.id;

            axios.delete(`${apiUrl}/api/${apiPath}/cart/${item.id}`)
                .then(res => {

                    // 清空loading狀態
                    this.status.adjustQtyLoading = '';

                    //提示訊息
                    alert(`${res.data.message}`);

                    //更新購物車
                    this.getCart();
                })
        },

        //刪除全部購物車
        removeAllItem() {
            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
                .then(res => {
                    //提示訊息
                    alert(`${res.data.message}`);

                    //更新購物車
                    this.getCart();
                })
        },

        onSubmit() {
            const order = this.form
            console.log(order)
            axios.post(`${apiUrl}/api/${apiPath}/order`, { data: order })
                .then(res => {
                    //提示訊息
                    alert(`${res.data.message}`);

                    //清空表單
                    this.$refs.form.resetForm();
                    this.form.message = '' ;

                    //更新購物車
                    this.getCart();
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
            this.productModal.show();
        },

        close() {
            this.productModal.hide();
        }
    },
    watch: {
        tempProduct() {
            //監測到數量變動後自動變回預設值1
            this.qty = 1;
        }
    },
    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal)
    }

});
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');