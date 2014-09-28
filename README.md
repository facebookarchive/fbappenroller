fbappenroller
=============

## Description & Notes

A small utility to assist with the bulk management of Facebook users as app developers.
Demonstrates:

* Login with Facebook using the JavaScript SDK
* Retrieving a list of the apps a user administers via FQL
* Role management via the Graph API for roles (https://developers.facebook.com/docs/graph-api/reference/app/#roles)

This tool makes use of the open source front-end framework Bootstrap (http://getbootstrap.com/). Many thanks to the Bootstrap team.

## Using the tool

This code is publicly available at: https://fbenroller.parseapp.com/
The tool is hosted, for free, by Parse (https://www.parse.com).

This tool is provided 'as is' for the purposes of demonstrating the functionality of the Graph API for roles.
Please use this code as a starting point for implementing your own solution.
Also note that this tool will submit your App Secret (in the form of a concatenated App Access Token - https://developers.facebook.com/docs/facebook-login/access-tokens/) across the wire. This is not recommended practise, as normally your app-secret should always be kept server-side. You should therefore always ensure this tool is used on a secure, SSL enabled connection (HTTPS).

## Contributing

All contributors must agree to and sign the [Facebook CLA](https://developers.facebook.com/opensource/cla) prior to submitting Pull Requests. We cannot accept Pull Requests until this document is signed and submitted.
