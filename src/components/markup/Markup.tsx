import * as React from 'react'
import { ASTError, ASTErrorMessage } from './ASTError'

export interface MarkupProps {
	code: string
	justTitle: boolean
}

export default abstract class Markup
	<AST, PropType extends MarkupProps = MarkupProps>
	extends React.Component<PropType> {
	ast: AST
	title: string | React.ReactNode
	constructor(props: PropType) {
		super(props)
		this.ast = this.getAST()
		try {
			this.title = this.getTitle()
		} catch (e) {
			if (e instanceof ASTError) {
				this.title = <ASTErrorMessage ast={e.ast}>{e.msg}</ASTErrorMessage>
			} else throw e
		}
	}
	
	render(): React.ReactNode {
		const rendered = this.props.justTitle
			? this.title
			: this.renderPost()
		if (process.env.NODE_ENV === 'development') {
			return (
				<>
					{rendered}
					<pre>{JSON.stringify(this.ast, undefined, '\t')}</pre>
				</>
			)
		}
		return rendered
	}
	
	abstract getAST(): AST
	abstract getTitle(): string
	abstract renderPost(): React.ReactNode
}
