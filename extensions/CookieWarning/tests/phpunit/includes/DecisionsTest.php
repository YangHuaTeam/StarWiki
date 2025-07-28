<?php

namespace CookieWarning\Tests;

use ConfigException;
use CookieWarning\Decisions;
use CookieWarning\GeoLocation;
use HashBagOStuff;
use MediaWikiIntegrationTestCase;
use MWException;
use RequestContext;
use WANObjectCache;

class DecisionsTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \CookieWarning\Decisions::shouldShowCookieWarning()
	 * @throws ConfigException
	 * @throws MWException
	 */
	public function testShouldNotCallGeoLocationMultiple() {
		$this->overrideConfigValues( [
			'CookieWarningEnabled' => true,
			'CookieWarningGeoIPLookup' => 'php',
			'CookieWarningForCountryCodes' => [ 'EU' => 'European Union' ],
		] );

		$geoLocation = $this->getMockBuilder( GeoLocation::class )
			->disableOriginalConstructor()
			->getMock();
		$geoLocation->method( 'locate' )->willReturn( 'EU' );

		$geoLocation->expects( $this->once() )->method( 'locate' );
		$cookieWarningDecisions = new Decisions(
			$this->getServiceContainer()->getService( 'CookieWarning.Config' ),
			$geoLocation,
			new WANObjectCache( [ 'cache' => new HashBagOStuff() ] ),
			$this->getServiceContainer()->getUserOptionsLookup()
		);

		$cookieWarningDecisions->shouldShowCookieWarning( RequestContext::getMain() );
		$cookieWarningDecisions->shouldShowCookieWarning( RequestContext::getMain() );
	}
}
