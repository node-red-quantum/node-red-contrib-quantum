const shell = require('../nodes/python').PythonShell;
const assert = require('chai').assert;
const dedent = require('dedent-js');

const NAME_ERROR =
`Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'x' is not defined`;


describe('PythonShell', function() {
  describe('#constructor', function() {
    before(() => {
      shell.stop();
    });

    it('python path is default', async function() {
      assert.match(shell.pythonPath, /(venv\/bin\/python)|(venv\/Scripts\/python.exe)/);
    });

    it('process starts empty', async function() {
      assert.isNull(shell.pythonProcess);
    });
  });

  describe('#start', function() {
    afterEach(() => {
      shell.stop();
    });

    it('start new process', async function() {
      shell.start();
      assert.isNotNull(shell.pythonProcess);
    });

    it('no-op if process is already running', async function() {
      shell.start();
      let process = shell.pythonProcess;
      shell.start();
      assert.strictEqual(shell.pythonProcess, process);
    });
  });

  describe('#stop', function() {
    beforeEach(async () => {
      shell.start();
    });

    it('stop current process', function() {
      shell.stop();
      assert.isNull(shell.pythonProcess);
    });

    it('no-op if process has already stopped', function() {
      shell.stop();
      let process = shell.pythonProcess;
      shell.stop();
      assert.strictEqual(shell.pythonProcess, process);
    });
  });

  describe('#restart', function() {
    afterEach(() => {
      shell.stop();
    });

    it('stop current process and start new process', async function() {
      shell.start();
      let process = shell.pythonProcess;
      shell.restart();
      assert.notStrictEqual(shell.pythonProcess, process);
    });

    it('start new process', async function() {
      shell.stop();
      shell.restart();
      assert.isNotNull(shell.pythonProcess);
    });
  });

  describe('#execute', function() {
    beforeEach(async () => {
      shell.start();
    });
    afterEach(() => {
      shell.stop();
    });

    it('return none on empty statement', async function() {
      let output = await shell.execute();
      assert.strictEqual(output, '');
    });

    it('return output on statement command', async function() {
      let output = await shell.execute('print("Text")');
      assert.strictEqual(output, 'Text');
    });

    it('return output on expression command', async function() {
      let output = await shell.execute('10 + 10');
      assert.strictEqual(output, '20');
    });

    it('return none on no-output command', async function() {
      let output = await shell.execute('x = 10');
      assert.strictEqual(output, '');
    });

    it('return output on multiple-statements command', async function() {
      let output = await shell.execute('print("Text"); print("More")');
      assert.strictEqual(output, 'Text\nMore');
    });

    it('return output on sequential commands', async function() {
      await shell.execute('x = 10');
      let output = await shell.execute('print(x)');
      assert.strictEqual(output, '10');
    });

    it('return output on block command', async function() {
      let input = dedent`
        x = 10
        if x < 20:
          print(x)
        
        `;
      let output = await shell.execute(input);
      assert.strictEqual(output, '10');
    });

    it('return output on loop command', async function() {
      let input = dedent`
        for i in range(3):
          print(i)
        
        print(i+1)
        `;
      let output = await shell.execute(input);
      assert.strictEqual(output, '0\n1\n2\n3');
    });

    it('return error on invalid command', async function() {
      let output = await shell.execute('print(x)').catch((err) => err);
      assert.strictEqual(output, NAME_ERROR);
    });

    it('return output with promise', async function() {
      let promise = shell.execute('print(10)');
      await promise
          .then((data) => {
            assert.strictEqual(data, '10');
          });
    });

    it('return outputs on parallel statement commands', async function() {
      let outputs = await Promise.all([
        shell.execute('print(1)'),
        shell.execute('print(2)'),
        shell.execute('print(3)'),
      ]);
      assert.deepEqual(outputs, ['1', '2', '3']);
    });

    it('return outputs on parallel loop commands', async () => {
      let outputs = await Promise.all([
        shell.execute('for i in range(0, 3): print(i)'),
        shell.execute('for i in range(3, 6): print(i)'),
        shell.execute('for i in range(6, 9): print(i)'),
      ]);
      assert.deepEqual(outputs, ['0\n1\n2', '3\n4\n5', '6\n7\n8']);
    });

    it('return errors on parallel invalid commands', async () => {
      let outputs = await Promise.all([
        shell.execute('print(x)').catch((err) => err),
        shell.execute('print(x)').catch((err) => err),
      ]);
      assert.deepEqual(outputs, [NAME_ERROR, NAME_ERROR]);
    });

    it('return errors and outputs on parallel mixed commands', async () => {
      let outputs = await Promise.all([
        shell.execute('print(x)').catch((err) => err),
        shell.execute('x = 10'),
        shell.execute('print(x)'),
      ]);
      assert.deepEqual(outputs, [NAME_ERROR, '', '10']);
    });
  });
});
