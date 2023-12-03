import Head from 'next/head';

const Play2048 = () => {
    return (
        <div>
            <Head>
                <title>Play 2048</title>
            </Head>
            <iframe src="/2048/index.html" width="100%" height="600px" />
        </div>
    );
};

export default Play2048;
