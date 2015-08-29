/*eslint-disable react/prop-types */
import React, { cloneElement, findDOMNode } from 'react';
import classNames from 'classnames';
import getScrollbarSize from 'dom-helpers/util/scrollbarSize';

import canUseDOM from 'dom-helpers/util/inDOM';
import ownerDocument from 'dom-helpers/ownerDocument';
import events from 'dom-helpers/events';
import createChainedFunction from './utils/createChainedFunction';
import elementType from 'react-prop-types/lib/elementType';

import Fade from './Fade';
import ModalDialog from './ModalDialog';
import Body from './ModalBody';
import Header from './ModalHeader';
import Title from './ModalTitle';
import Footer from './ModalFooter';

import BaseModal from 'react-overlays/lib/Modal';
import isOverflowing from 'react-overlays/lib/utils/isOverflowing';
import pick from 'lodash/object/pick';

const Modal = React.createClass({

  propTypes: {

    /**
     * Include a backdrop component. Specify 'static' for a backdrop that doesn't trigger an "onHide" when clicked.
     */
    backdrop: React.PropTypes.oneOf(['static', true, false]),

    /**
     * Close the modal when escape key is pressed
     */
    keyboard: React.PropTypes.bool,

    /**
     * Open and close the Modal with a slide and fade animation.
     */
    animation: React.PropTypes.bool,

    /**
     * A Component type that provides the modal content Markup. This is a useful prop when you want to use your own
     * styles and markup to create a custom modal component.
     */
    dialogComponent: elementType,

    /**
     * When `true` The modal will automatically shift focus to itself when it opens, and replace it to the last focused element when it closes.
     * Generally this should never be set to false as it makes the Modal less accessible to assistive technologies, like screen-readers.
     */
    autoFocus: React.PropTypes.bool,

    /**
     * When `true` The modal will prevent focus from leaving the Modal while open.
     * Consider leaving the default value here, as it is necessary to make the Modal work well with assistive technologies,
     * such as screen readers.
     */
    enforceFocus: React.PropTypes.bool,

    /**
     * Hide this from automatic props documentation generation.
     * @private
     */
    bsStyle: React.PropTypes.string,

    /**
     * When `true` The modal will show itself.
     */
    show: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      ...BaseModal.defaultProps,
      bsClass: 'modal',
      dialogComponent: ModalDialog,
    };
  },

  getInitialState() {
    return {
      modalStyles: {}
    };
  },

  render() {
    let {
        className
      , children
      , bsClass
      , dialogClassName
      , animation
      , ...props } = this.props;

    let { modalStyles } = this.state;

    let inClass = { in: props.show && !animation };
    let Dialog = props.dialogComponent;

    let parentProps = pick(props,
      Object.keys(BaseModal.propTypes).concat(
        ['onExit', 'onExiting', 'onEnter', 'onEntering', 'onEntered'])
    );

    let modal = (
      <Dialog
        key='modal'
        ref={ref => this._modal = ref}
        {...props}
        bsClass={bsClass}
        style={modalStyles}
        className={classNames(className, inClass)}
        dialogClassName={dialogClassName}
        onClick={props.backdrop === true ? this.handleDialogClick : null}
      >
        { this.renderContent() }
      </Dialog>
    );

    return (
      <BaseModal
        {...parentProps}
        show={props.show}
        ref={ref => {
          this._wrapper = (ref && ref.refs.modal);
          this._backdrop = (ref && ref.refs.backdrop);
        }}
        onEntering={this._onShow}
        onExited={this._onHide}
        backdropClassName={classNames(bsClass + '-backdrop', inClass)}
        containerClassName={bsClass + '-open'}
        transition={animation ? Fade : undefined}
        dialogTransitionTimeout={Modal.TRANSITION_DURATION}
        backdropTransitionTimeout={Modal.BACKDROP_TRANSITION_DURATION}
      >
        { modal }
      </BaseModal>
    );
  },

  renderContent() {
    return React.Children.map(this.props.children, child => {
      // TODO: use context in 0.14
      if (child && child.type && child.type.__isModalHeader) {
        return cloneElement(child, {
          onHide: createChainedFunction(this.props.onHide, child.props.onHide)
        });
      }
      return child;
    });
  },

  _onShow(...args) {
    events.on(window, 'resize', this.handleWindowResize);

    this.iosClickHack();

    this.setState(
      this._getStyles()
    );

    if (this.props.onEntering) {
      this.props.onEntering(...args);
    }
  },

  _onHide(...args) {
    events.off(window, 'resize', this.handleWindowResize);

    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  },

  handleDialogClick(e) {
    if (e.target !== e.currentTarget) {
      return;
    }

    this.props.onHide();
  },

  handleWindowResize() {
    this.setState(this._getStyles());
  },

  iosClickHack() {
    // IOS only allows click events to be delegated to the document on elements
    // it considers 'clickable' - anchors, buttons, etc. We fake a click handler on the
    // DOM nodes themselves. Remove if handled by React: https://github.com/facebook/react/issues/1169
    React.findDOMNode(this._modal).onclick = function () {};
  },

  _getStyles() {
    if (!canUseDOM) {
      return {};
    }

    let node = findDOMNode(this._modal);
    let doc = ownerDocument(node);
    let scrollHt = node.scrollHeight;
    let bodyIsOverflowing = isOverflowing(findDOMNode(this.props.container || doc.body));
    let modalIsOverflowing = scrollHt > doc.documentElement.clientHeight;

    return {
      modalStyles: {
        paddingRight: bodyIsOverflowing && !modalIsOverflowing ? getScrollbarSize() : void 0,
        paddingLeft:  !bodyIsOverflowing && modalIsOverflowing ? getScrollbarSize() : void 0
      }
    };
  }
});

Modal.Body = Body;
Modal.Header = Header;
Modal.Title = Title;
Modal.Footer = Footer;

Modal.Dialog = ModalDialog;

Modal.TRANSITION_DURATION = 300;
Modal.BACKDROP_TRANSITION_DURATION = 150;

export default Modal;
