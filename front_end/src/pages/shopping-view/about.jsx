function AboutPage() {
    return (
        <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-bold mb-6'>About us</h1>
            <div className='prose max-w-none'>
                <p className='mb-4'>
                    CANIFA is a Vietnamese fashion brand with over 20 years of experience in the
                    garment industry. We are proud to bring customers high quality products at
                    reasonable prices.
                </p>
                <h2 className='text-2xl font-bold mt-6 mb-4'>Version</h2>
                <p className='mb-4'>
                    To become the leading fashion brand in Vietnam, bringing quality products and
                    great shopping experiences to customers.
                </p>
                <h2 className='text-2xl font-bold mt-6 mb-4'>Mission</h2>
                <p className='mb-4'>
                    Continuously innovate and develop to bring high quality fashion products,
                    suitable for the needs and styles of Vietnamese people.
                </p>
            </div>
        </div>
    );
}

export default AboutPage;
