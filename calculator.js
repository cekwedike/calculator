class Calculator {
    constructor() {
        this.display = document.querySelector('.display');
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;
        this.memory = [];
        this.isRadians = true;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => this.handleNumber(button.textContent));
        });

        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => this.handleOperator(button.textContent));
        });

        document.querySelectorAll('.scientific').forEach(button => {
            button.addEventListener('click', () => this.handleScientific(button.textContent));
        });

        document.querySelector('.equals').addEventListener('click', () => this.calculate());
        document.querySelector('.clear').addEventListener('click', () => this.clear());
        document.querySelector('.decimal').addEventListener('click', () => this.handleDecimal());

        // Add keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
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

    handleDecimal() {
        if (this.shouldResetDisplay) {
            this.currentValue = '0.';
            this.shouldResetDisplay = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
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

    handleScientific(func) {
        const value = parseFloat(this.currentValue);
        let result;

        switch (func) {
            case 'sin':
                result = this.isRadians ? Math.sin(value) : Math.sin(value * Math.PI / 180);
                break;
            case 'cos':
                result = this.isRadians ? Math.cos(value) : Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = this.isRadians ? Math.tan(value) : Math.tan(value * Math.PI / 180);
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case '√':
                result = Math.sqrt(value);
                break;
            case 'x²':
                result = Math.pow(value, 2);
                break;
            case 'x^y':
                this.operation = '^';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'π':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case '(':
                this.memory.push(this.currentValue);
                this.currentValue = '0';
                break;
            case ')':
                if (this.memory.length > 0) {
                    const prevValue = this.memory.pop();
                    this.currentValue = prevValue;
                }
                break;
            default:
                return;
        }

        this.currentValue = this.formatResult(result);
        this.updateDisplay();
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
                case '^': result = Math.pow(prev, current); break;
                default: return;
            }

            this.currentValue = this.formatResult(result);
            this.previousValue = null;
            this.operation = null;
            this.updateDisplay();
        } catch (error) {
            this.display.textContent = 'Error';
            this.clear();
        }
    }

    formatResult(result) {
        let formatted = result.toString();
        
        // Handle very large or small numbers
        if (formatted.length > 10) {
            formatted = parseFloat(result).toExponential(5);
        }
        
        // Remove trailing zeros after decimal
        if (formatted.includes('.')) {
            formatted = formatted.replace(/\.?0+$/, '');
        }
        
        return formatted;
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.memory = [];
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.textContent = this.currentValue;
    }

    handleKeyboardInput(e) {
        if (e.key >= '0' && e.key <= '9') {
            this.handleNumber(e.key);
        } else if (['+', '-', '*', '/', '^'].includes(e.key)) {
            this.handleOperator(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === '.') {
            this.handleDecimal();
        } else if (e.key === '(') {
            this.handleScientific('(');
        } else if (e.key === ')') {
            this.handleScientific(')');
        }
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
}); 