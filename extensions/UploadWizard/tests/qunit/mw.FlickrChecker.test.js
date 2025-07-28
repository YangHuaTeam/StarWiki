QUnit.module( 'ext.uploadWizard/mw.FlickrChecker.test.js', ( hooks ) => {
	'use strict';

	hooks.beforeEach( () => {
		mw.FlickrChecker.fileNames = {};
	} );

	function getInstance() {
		var wizard = new mw.UploadWizard( {} );
		// FlickrChecker doesn't actually do much with the upload so we can omit some of its dependencies
		var upload = new mw.UploadWizardUpload( wizard, {} );
		return new mw.FlickrChecker( wizard, upload );
	}

	QUnit.test( 'getFilenameFromItem() simple case', ( assert ) => {
		var flickrChecker = getInstance();
		assert.strictEqual(
			flickrChecker.getFilenameFromItem( 'foo', 123, 'johndoe' ),
			'foo.jpg'
		);
	} );

	QUnit.test( 'getFilenameFromItem() with empty title', ( assert ) => {
		var flickrChecker = getInstance();
		assert.strictEqual(
			flickrChecker.getFilenameFromItem( '', 123, 'johndoe' ),
			'johndoe - 123.jpg'
		);
	} );

	QUnit.test( 'getFilenameFromItem() name conflict within instance', ( assert ) => {
		var flickrChecker = getInstance(),
			fileName = flickrChecker.getFilenameFromItem( 'foo', 123, 'johndoe' );
		assert.strictEqual(
			flickrChecker.getFilenameFromItem( 'foo', 123, 'johndoe' ),
			'foo.jpg'
		);
		flickrChecker.reserveFileName( fileName );
		assert.strictEqual(
			flickrChecker.getFilenameFromItem( 'foo', 123, 'johndoe' ),
			'foo - 123.jpg'
		);
	} );

	QUnit.test( 'getFilenameFromItem() name conflict between different instances', ( assert ) => {
		var flickrChecker = getInstance();
		var fileName = flickrChecker.getFilenameFromItem( 'foo', 123, 'johndoe' );
		assert.strictEqual(
			flickrChecker.getFilenameFromItem( 'foo', 123, 'johndoe' ),
			'foo.jpg'
		);

		flickrChecker.reserveFileName( fileName );
		flickrChecker = getInstance();
		assert.strictEqual(
			flickrChecker.getFilenameFromItem( 'foo', 123, 'johndoe' ),
			'foo - 123.jpg'
		);
	} );

	QUnit.test( 'setUploadDescription', function ( assert ) {
		var flickrChecker = getInstance();
		var upload = {};
		var sidstub = this.sandbox.stub( flickrChecker, 'setImageDescription' );

		flickrChecker.setUploadDescription( upload );
		assert.true( sidstub.called );
		assert.true( !upload.description );

		sidstub.reset();
		upload = {};
		flickrChecker.setUploadDescription( upload, 'Testing' );
		assert.strictEqual( upload.description, 'Testing' );
		assert.false( sidstub.called );

		sidstub.reset();
		upload = {};
		flickrChecker.setUploadDescription( upload, 'Testing | 1234' );
		assert.strictEqual( upload.description, 'Testing &#124; 1234' );
		assert.false( sidstub.called );

		upload = {};
		flickrChecker.setUploadDescription( upload, 'Testing | 1234 | 5678' );
		assert.strictEqual( upload.description, 'Testing &#124; 1234 &#124; 5678' );

		sidstub.reset();
		upload = {};
		flickrChecker.setUploadDescription( upload, '' );
		assert.false( sidstub.called );
		assert.strictEqual( upload.description, '' );
	} );
} );
