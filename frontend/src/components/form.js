import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {
    constructor(page) {
        this.agreeElement = null;
        this.progressElement = null;
        this.page = page;
        this.userRequestInfo = null;

        const accessToken = localStorage.getItem(Auth.accessTokenKey);

        if (accessToken) {
            location.href = '#/choice';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false
            },

            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false
            }
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false
                },

                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false
                },
            )
        }

        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateFields.call(that, item, this);
            };
        });

        this.progressElement = document.getElementById('process');
        this.progressElement.onclick = function () {
            that.processForm();
        };

        if (this.page === 'signup') {
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function () {
                that.validateForm();
            };
        }
    }

    validateFields(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.parentNode.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.parentNode.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        const isValid = this.agreeElement ? this.agreeElement.checked && validForm : validForm;

        if (isValid) {
            this.progressElement.removeAttribute('disabled');
        } else {
            this.progressElement.setAttribute('disabled', 'disabled');
        }
        return isValid;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name').element.value,
                        lastName: this.fields.find(item => item.name === 'lastName').element.value,
                        email: email,
                        password: password
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }

                    this.userRequestInfo = result.user;

                    if (this.userRequestInfo) {
                        localStorage.setItem('name',this.userRequestInfo.name);
                        localStorage.setItem('lastName',this.userRequestInfo.lastName);
                        localStorage.setItem('email',this.userRequestInfo.email);
                    }
                } catch (error) {
                    return console.log(error);
                }
            }

            try {
                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password
                });

                if (result) {
                    if (result.error || !result.accessToken || !result.refreshToken || !result.fullName || !result.userId) {
                        throw new Error(result.message);
                    }

                    Auth.setTokens(result.accessToken, result.refreshToken);
                    Auth.setUserInfo({
                        fullName: result.fullName,
                        userId: result.userId
                    });

                    location.href = '#/choice';
                }
            } catch (error) {
                console.log(error);
            }

        }
    }
}