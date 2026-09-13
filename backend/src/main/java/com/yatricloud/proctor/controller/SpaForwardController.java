package com.yatricloud.proctor.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards SPA client-side routes to index.html so direct navigation
 * and browser refresh work seamlessly in production.
 */
@Controller
public class SpaForwardController {

    @RequestMapping(value = {
        "/",
        "/exam/**",
        "/admin/**",
        "/onvue/**",
        "/portal/**",
        "/mobile/**",
        "/simulation/**",
        "/results/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
