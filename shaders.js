/**
 * Full-screen textured quad shader
 */

const FogShader = {

	name: 'FogShader',

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
        'depthBuffer': { value: null }
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;
		uniform sampler2D tDiffuse;
        uniform sampler2D depthBuffer;

		varying vec2 vUv;

        const float fogDensity = 0.0025;
        const vec4 fogColour = vec4(0.1, 0.05, 0.05, 1.0);

		void main() {
            vec4 texel = texture2D( tDiffuse, vUv );
			vec4 color = opacity * texel;
            float depth = texture2D( depthBuffer, vUv ).r;
            float fogFactor = 1.0 / pow(2.0, (depth * fogDensity) * (depth * fogDensity));
            color = mix(fogColour, color, fogFactor);
            gl_FragColor = vec4(depth, depth, depth, depth);
            // gl_FragColor = color; // default fragment color
		}`

};

export { FogShader };