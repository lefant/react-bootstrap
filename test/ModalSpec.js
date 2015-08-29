import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Modal from '../src/Modal';
import { render, shouldWarn } from './helpers';

describe('Modal', function () {
  let mountPoint;

  beforeEach(()=>{
    mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
  });

  afterEach(function () {
    React.unmountComponentAtNode(mountPoint);
    document.body.removeChild(mountPoint);
  });

  it('Should render the modal content', function() {
    let noOp = function () {};
    let instance = render(
      <Modal show onHide={noOp} animation={false}>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    assert.ok(
      ReactTestUtils.findRenderedDOMComponentWithTag(instance._modal, 'strong'));
  });

  it('Should close the modal when the modal dialog is clicked', function (done) {
    let doneOp = function () { done(); };

    let instance = render(
      <Modal show onHide={doneOp}>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    let dialog = React.findDOMNode(instance._modal);

    ReactTestUtils.Simulate.click(dialog);
  });

  it('Should not close the modal when the "static" dialog is clicked', function () {
    let onHideSpy = sinon.spy();
    let instance = render(
      <Modal show onHide={onHideSpy} backdrop='static'>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    let dialog = React.findDOMNode(instance._modal);

    ReactTestUtils.Simulate.click(dialog);

    expect(onHideSpy).to.not.have.been.called;
  });

  it('Should close the modal when the modal close button is clicked', function (done) {
    let doneOp = function () { done(); };

    let instance = render(
      <Modal show onHide={doneOp}>
        <Modal.Header closeButton />
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    let button = React.findDOMNode(instance._modal)
        .getElementsByClassName('close')[0];

    ReactTestUtils.Simulate.click(button);
  });

  it('Should pass className to the dialog', function () {
    let noOp = function () {};
    let instance = render(
      <Modal show className='mymodal' onHide={noOp}>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    let dialog = React.findDOMNode(instance._modal);

    assert.ok(dialog.className.match(/\bmymodal\b/));
  });

  it('Should use bsClass on the dialog', function () {
    let noOp = function () {};
    let instance = render(
      <Modal show bsClass='mymodal' onHide={noOp}>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    let dialog = React.findDOMNode(instance._modal).firstChild;

    assert.ok(dialog.className.match(/\bmymodal\b/));
    // assert.ok(dialog.children[0].className.match(/\bmymodal-dialog\b/));
    // assert.ok(dialog.children[0].children[0].className.match(/\bmymodal-content\b/));

    shouldWarn(/Invalid prop 'bsClass' of value 'mymodal'/);
  });

  it('Should pass bsSize to the dialog', function () {
    let noOp = function () {};
    let instance = render(
      <Modal show bsSize='small' onHide={noOp}>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    let dialog = React.findDOMNode(instance._modal).getElementsByClassName('modal-dialog')[0];

    assert.ok(dialog.className.match(/\bmodal-sm\b/));

  });

  it('Should pass dialogClassName to the dialog', function () {
    let noOp = function () {};
    let instance = render(
      <Modal show dialogClassName="testCss" onHide={noOp}>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    let dialog = ReactTestUtils.findRenderedDOMComponentWithClass(instance._modal, 'modal-dialog');
    assert.match(dialog.props.className, /\btestCss\b/);
  });


  it('Should use dialogComponent', function () {
    let noOp = function () {};

    class CustomDialog {
      render(){ return <div {...this.props}/>; }
    }

    let instance = render(
      <Modal show dialogComponent={CustomDialog} onHide={noOp}>
        <strong>Message</strong>
      </Modal>
    , mountPoint);

    assert.ok(instance._modal instanceof CustomDialog);
  });

  it('Should pass transition callbacks to Transition', function (done) {
    let count = 0;
    let increment = ()=> count++;

    let instance = render(
      <Modal show
        onHide={()=>{}}
        onExit={increment}
        onExiting={increment}
        onExited={()=> {
          increment();
          expect(count).to.equal(6);
          done();
        }}
        onEnter={increment}
        onEntering={increment}
        onEntered={()=> {
          increment();
          instance.setProps({ show: false });
        }}
      >
        <strong>Message</strong>
      </Modal>
      , mountPoint);
  });

});
