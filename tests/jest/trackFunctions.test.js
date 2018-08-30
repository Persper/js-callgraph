/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const { trackFunctions } = require('../../src/trackFunctions');
const astutil = require('../../src/astutil');
const fs = require('fs');

test('Test trackFunctions', () => {
	const truth = {
		'WebPage.js:includeJs:86:96': 'WebPage.js:includeJs:86:88',
        'WebPage.js:viewportSize:101:103': 'WebPage.js:viewportSize:93:95',
        'WebPage.js:customHeaders:108:110': 'WebPage.js:customHeaders:100:102',
        'WebPage.js:customHeaders:115:117': 'WebPage.js:customHeaders:107:109',
        'WebPage.js:injectJs:122:129': 'WebPage.js:injectJs:114:121',
        'WebPage.js:plainText:134:136': 'WebPage.js:plainText:126:128',
        'WebPage.js:title:141:143': 'WebPage.js:title:133:135',
        'WebPage.js:onError:148:150': 'WebPage.js:onError:140:142',
        'WebPage.js:onError:155:159': 'WebPage.js:onError:147:151',
        'WebPage.js:onConfirm:164:166': 'WebPage.js:onConfirm:156:158',
        'WebPage.js:onConfirm:171:175': 'WebPage.js:onConfirm:163:167',
        'WebPage.js:_onDialog:177:182': 'WebPage.js:_onDialog:169:174',
        'WebPage.js:url:187:189': 'WebPage.js:url:179:181',
        'WebPage.js:content:194:196': 'WebPage.js:content:186:188',
        'WebPage.js:open:202:217': 'WebPage.js:open:194:209',
        'WebPage.js:anon:204:216': 'WebPage.js:anon:196:208',
        'WebPage.js:viewportSize:222:224': 'WebPage.js:viewportSize:214:216',
        'WebPage.js:evaluate:230:232': 'WebPage.js:evaluate:222:224',
        'WebPage.js:render:237:257': 'WebPage.js:render:229:249',
        'WebPage.js:release:259:261': 'WebPage.js:release:251:253',
        'WebPage.js:close:263:265': 'WebPage.js:close:255:257',
        'WebPage.js:constructor:272:274': 'WebPage.js:constructor:264:266',
        'WebPage.js:userAgent:279:281': 'WebPage.js:userAgent:271:273',
        'WebPage.js:userAgent:286:288': 'WebPage.js:userAgent:278:280',
        'WebPage.js:constructor:305:311': 'WebPage.js:constructor:297:303',
        'WebPage.js:_onListenerAdded:313:320': 'WebPage.js:_onListenerAdded:305:312',
        'WebPage.js:anon:315:317': 'WebPage.js:anon:307:309',
        'WebPage.js:anon:316:316': 'WebPage.js:anon:308:308',
        'WebPage.js:_onListenerRemoved:322:324': 'WebPage.js:_onListenerRemoved:314:316'
    }
	const oldFname = 'tests/jest/WebPage.old';
	const newFname = 'tests/jest/WebPage.new';
	const oldSrc = fs.readFileSync(oldFname, 'utf-8');
	const newSrc = fs.readFileSync(newFname, 'utf-8');
	const oldAST = astutil.buildSingleAST('WebPage.js', oldSrc);
	const newAST = astutil.buildSingleAST('WebPage.js', newSrc);
	const oldFuncLst = astutil.getFunctions(oldAST);
	const newFuncLst = astutil.getFunctions(newAST);
	expect(trackFunctions(oldFuncLst, newFuncLst)).toEqual(truth);
});

