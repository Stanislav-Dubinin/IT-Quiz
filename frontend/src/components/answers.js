import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Answers {
    constructor() {
        this.quiz = null;
        this.quizCorrectAnswers = null;
        this.selectedAnswersId = null;
        this.questionId = null;

        this.init();
    }

    async init() {
        const answersId = Array.from(localStorage.getItem('answersId').split(','));
        const questionId = localStorage.getItem('questionId');
        this.selectedAnswersId = answersId;
        this.questionId = questionId;

        if (questionId) {
            const userInfo = Auth.getUserInfo();

            if (!userInfo) {
                location.href = '#/';
            }

            let result = await CustomHttp.request(config.host + '/tests/' + questionId + '/result/details?userId=' + userInfo.userId);
            this.quiz = result;
        } else {
            location.href = '#/';
        }

        this.showQuestion();
        this.selectedQuestionAnswer();
        this.createFullNamePerson();
        this.settingLinkAction();
    }

    showQuestion() {
        document.getElementById('pre-title-description').innerText = this.quiz.test.name;

        if (Array.isArray(this.quiz.test.questions) && this.quiz.test.questions.length > 0) {
            try {
                this.quiz.test.questions.forEach((question, id) => {
                    const answersOptionsBlock = document.getElementById('answers-options-block');

                    const questionTitle = document.createElement('div');
                    questionTitle.className = 'answers-option';

                    const answersOptionTitle = document.createElement('p');
                    answersOptionTitle.className = 'answers-option-title';

                    const answersOptionTitleSpanOne = document.createElement('span');
                    answersOptionTitleSpanOne.innerText = question.question;

                    const answersOptionTitleSpanTwo = document.createElement('span');
                    answersOptionTitleSpanTwo.className = 'blue-text'
                    answersOptionTitleSpanTwo.innerText = 'Вопрос ' + ++id + ': ';

                    answersOptionTitle.appendChild(answersOptionTitleSpanTwo);
                    answersOptionTitle.appendChild(answersOptionTitleSpanOne);
                    questionTitle.appendChild(answersOptionTitle);
                    answersOptionsBlock.appendChild(questionTitle);

                    if (Array.isArray(question.answers) && question.answers.length > 0) {
                        try {
                            question.answers.forEach(answer => {

                                const answersContainer = document.createElement('div');
                                answersContainer.className = 'answers-container';

                                const inputRadio = document.createElement('input');
                                inputRadio.setAttribute('type', 'radio');
                                inputRadio.setAttribute('name', 'answer-' + id);
                                inputRadio.setAttribute('id', answer.id);
                                inputRadio.className = 'question-answer';

                                const label = document.createElement('label');
                                label.setAttribute('for', answer.id);
                                label.innerText = answer.answer;

                                answersContainer.appendChild(inputRadio);
                                answersContainer.appendChild(label);
                                answersOptionsBlock.appendChild(answersContainer);
                            });
                        } catch (error) {
                            console.log('Данные от сервера отсутствуют. Не получены вопросы: ', error)
                        }

                    }

                });
            } catch (error) {
                console.log('Данные не были получены с сервера или имеют неверный формат:', error);
            }
        }
    }

    selectedQuestionAnswer() {
        const xhrCorrectAnswers = new XMLHttpRequest();
        xhrCorrectAnswers.open('GET', 'https://testologia.ru/get-quiz-right?id=' + this.questionId, false);
        xhrCorrectAnswers.send();

        if (xhrCorrectAnswers.status === 200 && xhrCorrectAnswers.responseText) {

            try {
                this.quizCorrectAnswers = JSON.parse(xhrCorrectAnswers.responseText);
            } catch (e) {
                location.href = '#/';
            }
        } else {
            location.href = '#/';
        }

        const questionAnswerItems = document.querySelectorAll('.question-answer');

        questionAnswerItems.forEach(answerItem => {
            if (this.selectedAnswersId.includes(answerItem.id)) {
                answerItem.setAttribute('checked', 'checked');

                if (this.quizCorrectAnswers.includes(parseInt(answerItem.id))) {
                    answerItem.className = 'right';
                    answerItem.nextElementSibling.className = 'right-text';
                } else {
                    answerItem.className = 'wrong';
                    answerItem.nextElementSibling.className = 'wrong-text';
                }
            }
        })
    }

    settingLinkAction() {
        const linkBack = document.getElementById('link-back');
        linkBack.addEventListener('click', (e) => {
            linkBack.setAttribute('href', '/#/result?id=' + this.questionId);
        });
    }

    createFullNamePerson() {
        const name = localStorage.getItem('name');
        const lastName = localStorage.getItem('lastName');
        const email = localStorage.getItem('email');

        if (name && lastName && email) {
            const testInfoPerson = document.getElementById('test-info-person');
            testInfoPerson.innerHTML = `<span>Тест выполнил </span><span class="full-name">${name} ${lastName}, ${email}</span>`;
        }
    }
}