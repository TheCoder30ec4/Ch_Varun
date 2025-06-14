import './styles/ContactSection.css'

const ContactSection = () =>{
    return (

        <section className="contact-section">
            <h2 className="section-title">Get in Touch</h2>

            <p className="contact-description">
                Feel free to reach out to me for collaboration, project ideas, or just a tech chat! <br></br><br />
                Made with passion and love ❤️ by Varun
            </p>

            <div className="contact-details">
                <p><strong>Email:</strong> <a href="mailto:varun30ec4@gmail.com">varun30ec4@gmail.com</a></p>
                <p><strong>GitHub:</strong> <a href="https://github.com/TheCoder30ec4" target="_blank" rel="noreferrer">TheCoder30ec4</a></p>
                <p><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/ch-varun" target="_blank" rel="noreferrer">Ch Varun</a></p>
            </div>
        </section>
    )
}

export default ContactSection