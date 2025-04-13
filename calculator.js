class Calculator {
    constructor() {
        this.display = document.querySelector('.display');
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => this.handleNumber(button.textContent));
        });

        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => this.handleOperator(button.textContent));
        });

        document.querySelector('.equals').addEventListener('click', () => this.calculate());
        document.querySelector('.clear').addEventListener('click', () => this.clear());
    }

    handleNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentValue = number;
            this.shouldResetDisplay = false;
        } else {
            this.currentValue = this.currentValue === '0' ? number : this.currentValue + number;
        }
        this.updateDisplay();
    }

    handleOperator(op) {
        if (this.previousValue !== null) {
            this.calculate();
        }
        this.operation = op;
        this.previousValue = this.currentValue;
        this.shouldResetDisplay = true;
    }

    calculate() {
        if (this.previousValue === null) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        try {
            switch (this.operation) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '×': result = prev * current; break;
                case '÷': 
                    if (current === 0) {
                        throw new Error('Division by zero');
                    }
                    result = prev / current; 
                    break;
                default: return;
            }

            // Handle display length
            result = result.toString();
            if (result.length > 10) {
                result = parseFloat(result).toExponential(5);
            }

            this.currentValue = result;
            this.previousValue = null;
            this.operation = null;
            this.updateDisplay();
        } catch (error) {
            this.display.textContent = 'Error';
            this.clear();
        }
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.textContent = this.currentValue;
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
}); 