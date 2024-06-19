import Error from 'next/error';

// eslint-disable-next-line react/prop-types
function Page({ statusCode }) {
	return <Error statusCode={statusCode} />;
}

Page.getInitialProps = ({ res, err }) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode };
};

export default Page;
