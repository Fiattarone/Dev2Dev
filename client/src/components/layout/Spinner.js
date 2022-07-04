import React, { Fragment } from "react";
import spinner from "./spinner.gif";

//TODO: Change background of spinner to translucent

export default () => (
    <Fragment>
        <img
            src={spinner}
            style={{ width: "200px", margin: "auto", display: "block "}}
            alt="Loading..."
        />
    </Fragment>
);