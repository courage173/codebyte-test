const express = require('express');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../api-doc/swagger-spec');

const router = express.Router();

const swaggerUiOptions = {
    customSiteTitle: 'TalentQl - Node API Task | API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

module.exports = router;
