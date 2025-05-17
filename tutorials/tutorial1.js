// 튜토리얼 1: 기본 삼각형
export const tutorial1 = {
    // WebGPU 초기화
    async initWebGPU() {
        console.log('WebGPU 초기화 시작...');
        try {
            if (!navigator.gpu) {
                throw new Error('WebGPU를 지원하지 않는 브라우저입니다.');
            }
            console.log('navigator.gpu 확인됨');

            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                throw new Error('WebGPU 어댑터를 찾을 수 없습니다.');
            }
            console.log('WebGPU 어댑터 확인됨');

            const device = await adapter.requestDevice();
            console.log('WebGPU 디바이스 생성됨');

            const canvas = document.querySelector('canvas');
            if (!canvas) {
                throw new Error('Canvas 요소를 찾을 수 없습니다.');
            }
            console.log('Canvas 요소 찾음');

            const context = canvas.getContext('webgpu');
            if (!context) {
                throw new Error('WebGPU 컨텍스트를 생성할 수 없습니다.');
            }
            console.log('WebGPU 컨텍스트 생성됨');

            const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
            context.configure({
                device: device,
                format: canvasFormat,
                alphaMode: 'premultiplied',
            });
            console.log('Canvas 설정 완료');

            console.log('WebGPU 초기화 성공!');
            return { device, canvas, context, canvasFormat };
        } catch (error) {
            console.error('WebGPU 초기화 중 오류 발생:', error);
            throw error;
        }
    },

    // 삼각형 버텍스 데이터 생성
    createTriangleVertices() {
        console.log('삼각형 버텍스 데이터 생성');
        return new Float32Array([
            0.0, 0.6, 0.0,  // 상단
            -0.5, -0.6, 0.0,  // 좌측 하단
            0.5, -0.6, 0.0,  // 우측 하단
        ]);
    },

    // 셰이더 코드
    shaderCode: `
        @vertex
        fn vertexMain(@location(0) position: vec3f) -> @builtin(position) vec4f {
            return vec4f(position, 1.0);
        }

        @fragment
        fn fragmentMain() -> @location(0) vec4f {
            return vec4f(1.0, 0.0, 0.0, 1.0); // 빨간색
        }
    `,

    // 렌더링 파이프라인 생성
    createPipeline(device, canvasFormat) {
        console.log('렌더링 파이프라인 생성 시작');
        try {
            const pipeline = device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                    module: device.createShaderModule({
                        code: this.shaderCode,
                    }),
                    entryPoint: 'vertexMain',
                    buffers: [{
                        arrayStride: 12, // 3 floats * 4 bytes
                        attributes: [{
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x3',
                        }],
                    }],
                },
                fragment: {
                    module: device.createShaderModule({
                        code: this.shaderCode,
                    }),
                    entryPoint: 'fragmentMain',
                    targets: [{
                        format: canvasFormat,
                    }],
                },
                primitive: {
                    topology: 'triangle-list',
                },
            });
            console.log('렌더링 파이프라인 생성 완료');
            return pipeline;
        } catch (error) {
            console.error('파이프라인 생성 중 오류 발생:', error);
            throw error;
        }
    },

    // 메인 렌더링 함수
    async render() {
        console.log('렌더링 시작');
        try {
            const { device, canvas, context, canvasFormat } = await this.initWebGPU();
            console.log('WebGPU 초기화 완료');

            const pipeline = this.createPipeline(device, canvasFormat);
            console.log('파이프라인 생성 완료');
            
            // 버텍스 버퍼 생성
            const vertices = this.createTriangleVertices();
            const vertexBuffer = device.createBuffer({
                size: vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            });
            device.queue.writeBuffer(vertexBuffer, 0, vertices);
            console.log('버텍스 버퍼 생성 및 데이터 쓰기 완료');

            // 렌더링 커맨드 인코더 생성
            const commandEncoder = device.createCommandEncoder();
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: context.getCurrentTexture().createView(),
                    clearValue: { r: 0.1, g: 0.2, b: 0.3, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            });

            renderPass.setPipeline(pipeline);
            renderPass.setVertexBuffer(0, vertexBuffer);
            renderPass.draw(3, 1, 0, 0);
            renderPass.end();
            console.log('렌더링 패스 설정 완료');

            device.queue.submit([commandEncoder.finish()]);
            console.log('렌더링 완료!');
        } catch (error) {
            console.error('렌더링 중 오류 발생:', error);
            throw error;
        }
    }
}; 