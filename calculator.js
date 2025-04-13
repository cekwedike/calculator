class Calculator {
    constructor() {
        this.display = document.querySelector('.display');
        this.historyDisplay = document.querySelector('.history-display');
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;
        this.memory = [];
        this.history = [];
        this.isRadians = false;
        this.currentMode = 'standard';
        this.numberBase = 'DEC';
        this.statisticsData = [];
        this.MAX_INPUT_LENGTH = 15;
        this.MAX_MEMORY_SLOTS = 10;
        this.focusedButton = null;
        this.keyboardMap = new Map([
            ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
            ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'],
            ['.', '.'], ['+', '+'], ['-', '-'], ['*', '×'], ['/', '÷'],
            ['Enter', '='], ['Escape', 'C'], ['Backspace', 'C'],
            ['s', 'sin'], ['c', 'cos'], ['t', 'tan'], ['l', 'log'],
            ['n', 'ln'], ['r', '√'], ['p', 'π'], ['e', 'e'],
            ['!', 'n!'], ['|', '|x|'], ['^', 'x^y'], ['2', 'x²'],
            ['h', 'HEX'], ['d', 'DEC'], ['o', 'OCT'], ['b', 'BIN'],
            ['a', 'AND'], ['o', 'OR'], ['x', 'XOR'], ['n', 'NOT'],
            ['m', 'MEAN'], ['v', 'VAR'], ['s', 'STD'], ['u', 'SUM']
        ]);
        
        this.initialize();
    }

    initialize() {
        this.modeDisplay = document.querySelector('.mode-display');
        this.historyPanel = document.querySelector('.history-panel');
        this.memoryPanel = document.querySelector('.memory-panel');
        this.historyContent = document.querySelector('.history-content');
        this.memoryContent = document.querySelector('.memory-content');

        // Number and operator buttons
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => this.handleNumber(button.textContent));
        });

        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => this.handleOperator(button.textContent));
        });

        // Scientific functions
        document.querySelectorAll('.scientific').forEach(button => {
            button.addEventListener('click', () => this.handleScientific(button.textContent));
        });

        // Programmer functions
        document.querySelectorAll('.programmer').forEach(button => {
            button.addEventListener('click', () => this.handleProgrammer(button.textContent));
        });

        // Statistics functions
        document.querySelectorAll('.statistics').forEach(button => {
            button.addEventListener('click', () => this.handleStatistics(button.textContent));
        });

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(button => {
            button.addEventListener('click', () => this.setMode(button.dataset.mode));
        });

        // Settings
        document.getElementById('angleMode').addEventListener('click', () => this.toggleAngleMode());
        document.getElementById('historyBtn').addEventListener('click', () => this.toggleHistoryPanel());
        document.getElementById('memoryBtn').addEventListener('click', () => this.toggleMemoryPanel());

        // Memory operations
        document.querySelector('.memory-store').addEventListener('click', () => this.storeMemory());
        document.querySelector('.memory-recall').addEventListener('click', () => this.recallMemory());
        document.querySelector('.memory-clear').addEventListener('click', () => this.clearMemory());

        // History operations
        document.querySelector('.clear-history').addEventListener('click', () => this.clearHistory());

        // Basic operations
        document.querySelector('.equals').addEventListener('click', () => this.calculate());
        document.querySelector('.clear').addEventListener('click', () => this.clear());
        document.querySelector('.decimal').addEventListener('click', () => this.handleDecimal());

        // Add keyboard event listener
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));

        // Add focus management
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'BUTTON') {
                this.focusedButton = e.target;
            }
        });

        // Add focus styles
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const buttons = document.querySelectorAll('button');
                const currentIndex = Array.from(buttons).indexOf(this.focusedButton);
                const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
                
                if (nextIndex >= 0 && nextIndex < buttons.length) {
                    buttons[nextIndex].focus();
                }
            }
        });
    }

    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide mode-specific buttons
        document.querySelectorAll('.scientific').forEach(btn => {
            btn.classList.toggle('hidden', mode !== 'scientific');
        });
        document.querySelectorAll('.programmer').forEach(btn => {
            btn.classList.toggle('hidden', mode !== 'programmer');
        });
        document.querySelectorAll('.statistics').forEach(btn => {
            btn.classList.toggle('hidden', mode !== 'statistics');
        });

        this.updateModeDisplay();
    }

    toggleAngleMode() {
        this.isRadians = !this.isRadians;
        document.getElementById('angleMode').textContent = this.isRadians ? 'RAD' : 'DEG';
    }

    handleScientific(func) {
        this.safeOperation(() => {
            const value = parseFloat(this.currentValue);
            let result;

            switch (func) {
                case 'sin':
                case 'cos':
                case 'tan':
                    result = this.isRadians ? Math[func](value) : Math[func](value * Math.PI / 180);
                    break;
                case 'sin⁻¹':
                case 'cos⁻¹':
                case 'tan⁻¹':
                    if (value < -1 || value > 1) throw new Error('Invalid input for inverse trig');
                    const inverseFunc = func.replace('⁻¹', '');
                    result = this.isRadians ? Math[`a${inverseFunc}`](value) : Math[`a${inverseFunc}`](value) * 180 / Math.PI;
                    break;
                case 'log':
                    if (value <= 0) throw new Error('Invalid input for logarithm');
                    result = Math.log10(value);
                    break;
                case 'ln':
                    if (value <= 0) throw new Error('Invalid input for natural log');
                    result = Math.log(value);
                    break;
                case '√':
                    if (value < 0) throw new Error('Invalid input for square root');
                    result = Math.sqrt(value);
                    break;
                case 'n!':
                    if (value < 0 || !Number.isInteger(value)) throw new Error('Invalid input for factorial');
                    if (value > 170) throw new Error('Factorial too large');
                    result = this.factorial(value);
                    break;
                case '1/x':
                    if (value === 0) throw new Error('Division by zero');
                    result = 1 / value;
                    break;
                case '|x|':
                    result = Math.abs(value);
                    break;
                case 'e^x':
                    result = Math.exp(value);
                    break;
                case '10^x':
                    result = Math.pow(10, value);
                    break;
                default:
                    throw new Error('Invalid operation');
            }

            this.currentValue = this.formatResult(result);
            this.updateDisplay();
            this.addToHistory(`${func}(${value}) = ${this.currentValue}`);
        });
    }

    handleProgrammer(func) {
        const value = parseInt(this.currentValue);
        let result;

        switch (func) {
            case 'HEX':
                this.currentValue = value.toString(16).toUpperCase();
                break;
            case 'DEC':
                this.currentValue = value.toString(10);
                break;
            case 'OCT':
                this.currentValue = value.toString(8);
                break;
            case 'BIN':
                this.currentValue = value.toString(2);
                break;
            case 'AND':
                this.operation = '&';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'OR':
                this.operation = '|';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'XOR':
                this.operation = '^';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'NOT':
                result = ~value;
                break;
            case '<<':
                this.operation = '<<';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case '>>':
                this.operation = '>>';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
        }

        if (result !== undefined) {
            this.currentValue = result.toString();
        }
        this.updateDisplay();
    }

    handleStatistics(func) {
        switch (func) {
            case 'DATA':
                this.statisticsData.push(parseFloat(this.currentValue));
                this.addToHistory(`Added ${this.currentValue} to dataset`);
                this.currentValue = '0';
                break;
            case 'MEAN':
                this.currentValue = this.calculateMean().toString();
                break;
            case 'MED':
                this.currentValue = this.calculateMedian().toString();
                break;
            case 'STD':
                this.currentValue = this.calculateStdDev().toString();
                break;
            case 'VAR':
                this.currentValue = this.calculateVariance().toString();
                break;
            case 'MIN':
                this.currentValue = Math.min(...this.statisticsData).toString();
                break;
            case 'MAX':
                this.currentValue = Math.max(...this.statisticsData).toString();
                break;
            case 'SUM':
                this.currentValue = this.statisticsData.reduce((a, b) => a + b, 0).toString();
                break;
        }
        this.updateDisplay();
    }

    calculateMean() {
        return this.statisticsData.reduce((a, b) => a + b, 0) / this.statisticsData.length;
    }

    calculateMedian() {
        const sorted = [...this.statisticsData].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calculateVariance() {
        const mean = this.calculateMean();
        return this.statisticsData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.statisticsData.length;
    }

    calculateStdDev() {
        return Math.sqrt(this.calculateVariance());
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    storeMemory() {
        this.safeOperation(() => {
            if (this.memory.length >= this.MAX_MEMORY_SLOTS) {
                throw new Error('Memory slots full');
            }
            this.memory.push(this.currentValue);
            this.updateMemoryPanel();
        });
    }

    recallMemory() {
        if (this.memory.length > 0) {
            this.currentValue = this.memory[this.memory.length - 1];
            this.updateDisplay();
        }
    }

    clearMemory() {
        this.memory = [];
        this.updateMemoryPanel();
    }

    addToHistory(entry) {
        this.history.push(entry);
        this.updateHistoryPanel();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryPanel();
    }

    updateHistoryPanel() {
        const historyContent = document.querySelector('.history-content');
        historyContent.innerHTML = this.history.map(entry => 
            `<div class="history-item">${entry}</div>`
        ).join('');
    }

    updateMemoryPanel() {
        const memoryContent = document.querySelector('.memory-content');
        memoryContent.innerHTML = this.memory.map((value, index) => 
            `<div class="memory-item">M${index + 1}: ${value}</div>`
        ).join('');
    }

    toggleHistoryPanel() {
        document.querySelector('.history-panel').classList.toggle('hidden');
    }

    toggleMemoryPanel() {
        document.querySelector('.memory-panel').classList.toggle('hidden');
    }

    calculate() {
        this.safeOperation(() => {
            if (this.previousValue === null) return;

            const prev = parseFloat(this.previousValue);
            const current = parseFloat(this.currentValue);
            let result;

            switch (this.operation) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '×': result = prev * current; break;
                case '÷': 
                    if (current === 0) throw new Error('Division by zero');
                    result = prev / current; 
                    break;
                case '^': 
                    if (prev === 0 && current < 0) throw new Error('Invalid power operation');
                    result = Math.pow(prev, current); 
                    break;
                case '&': result = prev & current; break;
                case '|': result = prev | current; break;
                case '<<': 
                    if (!Number.isInteger(current)) throw new Error('Invalid shift amount');
                    result = prev << current; 
                    break;
                case '>>': 
                    if (!Number.isInteger(current)) throw new Error('Invalid shift amount');
                    result = prev >> current; 
                    break;
                default: throw new Error('Invalid operation');
            }

            this.currentValue = this.formatResult(result);
            this.addToHistory(`${prev} ${this.operation} ${current} = ${this.currentValue}`);
            this.previousValue = null;
            this.operation = null;
            this.updateDisplay();
        });
    }

    formatResult(result) {
        let formatted = result.toString();
        
        if (formatted.length > 10) {
            formatted = parseFloat(result).toExponential(5);
        }
        
        if (formatted.includes('.')) {
            formatted = formatted.replace(/\.?0+$/, '');
        }
        
        return formatted;
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.textContent = this.currentValue;
        this.display.setAttribute('aria-label', `Display: ${this.currentValue}`);
    }

    handleKeyboardInput(e) {
        const key = e.key;
        const buttonText = this.keyboardMap.get(key);
        
        if (buttonText) {
            e.preventDefault();
            const button = Array.from(document.querySelectorAll('button'))
                .find(btn => btn.textContent === buttonText);
            
            if (button) {
                button.focus();
                button.click();
            }
        }

        // Handle special cases
        switch (key) {
            case 'ArrowUp':
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                this.navigateHistory(1);
                break;
            case 'ArrowLeft':
                this.navigateMemory(-1);
                break;
            case 'ArrowRight':
                this.navigateMemory(1);
                break;
            case 'm':
                if (e.ctrlKey) {
                    this.toggleMemoryPanel();
                }
                break;
            case 'h':
                if (e.ctrlKey) {
                    this.toggleHistoryPanel();
                }
                break;
        }
    }

    navigateHistory(direction) {
        if (this.history.length === 0) return;
        
        const currentIndex = this.history.indexOf(this.currentValue);
        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) newIndex = this.history.length - 1;
        if (newIndex >= this.history.length) newIndex = 0;
        
        this.currentValue = this.history[newIndex];
        this.updateDisplay();
    }

    navigateMemory(direction) {
        if (this.memory.length === 0) return;
        
        const currentIndex = this.memory.indexOf(this.currentValue);
        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) newIndex = this.memory.length - 1;
        if (newIndex >= this.memory.length) newIndex = 0;
        
        this.currentValue = this.memory[newIndex];
        this.updateDisplay();
    }

    handleNumber(number) {
        this.safeOperation(() => {
            if (this.shouldResetDisplay) {
                this.currentValue = number;
                this.shouldResetDisplay = false;
            } else {
                const newValue = this.currentValue === '0' ? number : this.currentValue + number;
                this.validateInput(newValue);
                this.currentValue = newValue;
            }
            this.updateDisplay();
        });
    }

    handleOperator(op) {
        if (this.previousValue !== null) {
            this.calculate();
        }
        this.operation = op;
        this.previousValue = this.currentValue;
        this.shouldResetDisplay = true;
    }

    handleDecimal() {
        this.safeOperation(() => {
            if (this.shouldResetDisplay) {
                this.currentValue = '0.';
                this.shouldResetDisplay = false;
            } else if (!this.currentValue.includes('.')) {
                const newValue = this.currentValue + '.';
                this.validateInput(newValue);
                this.currentValue = newValue;
            }
            this.updateDisplay();
        });
    }

    updateModeDisplay() {
        this.modeDisplay.textContent = this.currentMode.toUpperCase();
        this.modeDisplay.setAttribute('aria-label', `Current mode: ${this.currentMode}`);
    }

    // Add input validation
    validateInput(value) {
        if (value.length > this.MAX_INPUT_LENGTH) {
            throw new Error('Input too long');
        }
        if (isNaN(parseFloat(value))) {
            throw new Error('Invalid number');
        }
        return true;
    }

    // Add error handling wrapper
    safeOperation(operation) {
        try {
            return operation();
        } catch (error) {
            this.displayError(error.message);
            return null;
        }
    }

    displayError(message) {
        this.display.textContent = `Error: ${message}`;
        setTimeout(() => {
            this.clear();
        }, 2000);
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
}); 