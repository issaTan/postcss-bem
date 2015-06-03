var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

function process (input, opts) {
    return postcss([ plugin(opts) ]).process(input);
}

function test (input, output, opts, done) {
    process(input, opts).then(function (result) {
        expect(result.css).to.eql(output);
        expect(result.warnings()).to.be.empty;
        done();
    }).catch(function (error) {
        done(error);
    });
}

function testWarnings (input, output, warnings, opts, done) {
    process(input, opts).then(function (result) {
        var occuredWarnings = result.warnings();
        expect(result.css).to.eql(output);
        expect(occuredWarnings.length).to.be.equal(warnings.length);
        occuredWarnings.forEach(function (warning, i) {
            expect(warning.type).to.be.equal('warning');
            expect(warning.text).to.be.equal(warnings[i]);
        });
        done();
    }).catch(function (error) {
        done(error);
    });
}

describe('postcss-bem', function () {
    describe('@utility', function() {
        it('works with name only', function (done) {
            test('@utility utilityName {}', '.u-utilityName {}', {}, done);
        });

        it('works with small', function(done) {
            test('@utility utilityName, small {}', '.u-sm-utilityName {}', {}, done);
        });

        it('works with medium', function(done) {
            test('@utility utilityName, medium {}', '.u-md-utilityName {}', {}, done);
        });

        it('works with large', function(done) {
            test('@utility utilityName, large {}', '.u-lg-utilityName {}', {}, done);
        });

        it('warns when no args are supplied', function(done) {
            testWarnings('@utility {}', '.u- {}', ['Wrong param count for @utility'], {}, done);
        });

        it('warns when too many args are supplied', function(done) {
            testWarnings('@utility a, small, c {}', '.u-sm-a {}', ['Wrong param count for @utility'], {}, done);
        });

        it('warns when two args are supplied, the second of which is not allowed', function(done) {
            testWarnings('@utility a, b {}', '.u--a {}', ['Unknown variant: b'], {}, done);
        });
    });

    describe('@namespace', function () {
        it('should get removed when empty', function (done) {
            test('@namespace nmsp {}', '', {}, done);
        });
    });

    describe('@component', function() {
        it('works without properties', function (done) {
            test('@component ComponentName {}', '.ComponentName {}', {}, done);
        });

        it('works with properties', function (done) {
            test('@component ComponentName {color: red; text-align: right;}', '.ComponentName {color: red; text-align: right\n}', {}, done);
        });

        it('works in namespace', function (done) {
            test('@namespace nmsp {@component ComponentName {color: red; text-align: right;}}', '.nmsp-ComponentName {\n    color: red;\n    text-align: right\n}', {}, done);
        });
    });

    describe('@modifier', function() {
        it('works without properties', function (done) {
            test('@component ComponentName {@modifier modifierName {}}', '.ComponentName {}\n.ComponentName--modifierName {}', {}, done);
        });

        it('works with properties', function (done) {
            test('@component ComponentName {color: red; text-align: right; @modifier modifierName {color: blue; text-align: left;}}', '.ComponentName {color: red; text-align: right\n}\n.ComponentName--modifierName {color: blue; text-align: left\n}', {}, done);
        });
    });

    describe('@descendent', function() {
        it('works without properties', function (done) {
            test('@component ComponentName {@descendent descendentName {}}', '.ComponentName {}\n.ComponentName-descendentName {}', {}, done);
        });

        it('works with properties', function (done) {
            test('@component ComponentName {color: red; text-align: right; @descendent descendentName {color: blue; text-align: left;}}', '.ComponentName {color: red; text-align: right\n}\n.ComponentName-descendentName {color: blue; text-align: left\n}', {}, done);
        });
    });

    describe('@when', function() {
        it('works without properties', function (done) {
            test('@component ComponentName {@when stateName {}}', '.ComponentName {}\n.ComponentName.is-stateName {}', {}, done);
        });

        it('works with properties', function (done) {
            test('@component ComponentName {color: red; text-align: right; @when stateName {color: blue; text-align: left;}}', '.ComponentName {color: red; text-align: right\n}\n.ComponentName.is-stateName {color: blue; text-align: left\n}', {}, done);
        });
    });
});